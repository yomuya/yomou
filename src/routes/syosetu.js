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

async function scrapeChapterData(ncode, chapterNum) {
  const url = `https://ncode.syosetu.com/${encodeURIComponent(ncode)}/${encodeURIComponent(chapterNum)}`;
  const response = await fetch(url, headers);
  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('.p-novel__title').first().text().trim();
  const prefaceText = $('div.p-novel__text--preface').first().text().trim();
  const chapterText = $('div.p-novel__text:not(.p-novel__text--preface):not(.p-novel__text--afterword)').first().text().trim();
  const afterwordText = $('div.p-novel__text--afterword').first().text().trim();
  const len = prefaceText.length + chapterText.length + afterwordText.length;

  return {
    ncode,
    chapterNum: chapterNum,
    ...{
      title,
      preface: prefaceText,
      body: chapterText,
      afterword: afterwordText,
      length_chars: len,
      url 
    }
  };
}

router.post('/scrape', authenticateToken, async (req, res) => {
  const ncode = req.body.ncode ? req.body.ncode.toLowerCase() : undefined;
  const chapter = parseInt(req.body.chapter, 10);
  if (!ncode || isNaN(chapter) || chapter < 1) {
    return res.status(400).json({ error: 'Missing ncode or invalid chapter parameter' });
  }
  try {
    const chapterData = await scrapeChapterData(ncode, Number(chapter));
    res.json(chapterData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scrapeahead', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const ncode = req.body.ncode ? req.body.ncode.toLowerCase() : undefined;
  const start = parseInt(req.body.start, 10);
  const end = parseInt(req.body.end, 10);
  if (!ncode || isNaN(start) || isNaN(end) || start < 1 || end < start) {
    return res.status(400).json({ error: 'Missing ncode or invalid start/end parameter' });
  }
  // console.log('start: ', start);
  // console.log('end: ', end);
  let results = [];
  for (let ch = start; ch <= end; ++ch) {
    try {
      const chapterData = await scrapeChapterData(ncode, ch);
      results.push({ chapter: ch, success: true, data: chapterData });
    } catch (e) {
      results.push({ chapter: ch, success: false, error: e.message });
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  res.json({ success: true, results });
});


module.exports = { router };
