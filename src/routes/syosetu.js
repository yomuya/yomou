const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authenticateToken } = require('./users');
const cheerio = require('cheerio');

const { db } = require('../database');

const headers = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0',
    'Cookie': 'over18=yes'
  }
};

router.get('/', authenticateToken, async (req, res) => {
  const ncode = req.query.ncode ? req.query.ncode.toLowerCase() : undefined;
  const url = `https://api.syosetu.com/novelapi/api/?out=json&ncode=${encodeURIComponent(ncode)}`;
  try {
    const response = await fetch(url, headers);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/scrape', authenticateToken, async (req, res) => {
  const ncode = req.query.ncode ? req.query.ncode.toLowerCase() : undefined;
  const chapterNum = req.query.chapter;
  if (!ncode || !chapterNum) {
    return res.status(400).json({ error: 'Missing ncode or chapter parameter' });
  }
  const url = `https://ncode.syosetu.com/${encodeURIComponent(ncode.toLowerCase())}/${encodeURIComponent(chapterNum)}`;
  try {
    const response = await fetch(url);
    const html = await response.text();
    // console.log(html.slice(0, 1000));
    const $ = cheerio.load(html);

    const title = $('.p-novel__title').first().text().trim();
    const prefaceText = $('div.p-novel__text--preface').first().text().trim();
    const chapterText = $('div.p-novel__text:not(.p-novel__text--preface):not(.p-novel__text--afterword)').first().text().trim();
    const afterwordText = $('div.p-novel__text--afterword').first().text().trim();

    const len = prefaceText.length + chapterText.length + afterwordText.length;
    db.run(
      `INSERT OR REPLACE INTO chapters (ncode, chapter_number, title, preface, body, afterword, length_chars)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ncode, chapterNum, title, prefaceText, chapterText, afterwordText, len]
    );
    console.log(url);
    res.json({success: true});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scrapeahead', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const ncode = req.body.ncode ? req.body.ncode.toLowerCase() : undefined;
  const count = parseInt(req.body.count, 10) || 1;
  if (!ncode || count < 1) {
    return res.status(400).json({ error: 'Missing ncode or invalid count parameter' });
  }
  db.get(
    `SELECT current_chapter FROM user_novel_follows WHERE user_id = ? AND ncode = ?`,
    [req.user.id, ncode.toLowerCase()],
    async (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const start = (row?.current_chapter || 0) + 1;
      const end = start + count;
      let results = [];
      for (let ch = start; ch < end; ++ch) {
        const url = `https://ncode.syosetu.com/${encodeURIComponent(ncode)}/${encodeURIComponent(ch)}`;
        try {
          const response = await fetch(url);
          const html = await response.text();
          const $ = cheerio.load(html);
          const title = $('.p-novel__title').first().text().trim();
          const prefaceText = $('div.p-novel__text--preface').first().text().trim();
          const chapterText = $('div.p-novel__text:not(.p-novel__text--preface):not(.p-novel__text--afterword)').first().text().trim();
          const afterwordText = $('div.p-novel__text--afterword').first().text().trim();
          const len = prefaceText.length + chapterText.length + afterwordText.length;
          db.run(
            `INSERT OR REPLACE INTO chapters (ncode, chapter_number, title, preface, body, afterword, length_chars)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ncode, ch, title, prefaceText, chapterText, afterwordText, len]
          );
          results.push({ chapter: ch, success: true });
        } catch (e) {
          results.push({ chapter: ch, success: false, error: e.message });
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      res.json({ success: true, results });
    }
  );
});

router.get('/chapter', authenticateToken, async (req, res) => {
  const ncode = req.query.ncode ? req.query.ncode.toLowerCase() : undefined;
  const chapterNum = req.query.chapter;
  if (!ncode || !chapterNum) {
    return res.status(400).json({ error: 'Missing ncode or chapter parameter' });
  }
  db.get(
    `SELECT * FROM chapters WHERE ncode = ? AND chapter_number = ?`,
    [ncode, chapterNum],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Chapter not found' });
      }
      res.json(row);
    }
  );
});


module.exports = { router };
