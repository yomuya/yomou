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
  const ncode = req.query.ncode ? req.query.ncode.toUpperCase() : undefined;
  const url = `https://api.syosetu.com/novelapi/api/?out=json&ncode=${encodeURIComponent(ncode)}`;
  try {
    const response = await fetch(url, headers);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/scrape', async (req, res) => {
  const ncode = req.query.ncode ? req.query.ncode : "n4185ci";
  const chapter = req.query.chapter ? req.query.chapter : 5;
  const url = `https://ncode.syosetu.com/${encodeURIComponent(ncode)}/${encodeURIComponent(chapter)}`;
  try {
    const response = await fetch(url);
    const html = await response.text();
    // console.log(html.slice(0, 1000));
    const $ = cheerio.load(html);

    const title = $('.p-novel__title').first().text().trim();
    const preface = $('div.p-novel__text--preface').first().html().trim();
    const chapter = $('div.p-novel__text:not(.p-novel__text--preface):not(.p-novel__text--afterword)').first().html().trim();
    const afterword = $('div.p-novel__text--afterword').first().html().trim();

    const pageHtml = `
      <html>
        <head><meta charset="UTF-8"><title>${title}</title></head>
        <body>
          <h1>${title}</h1>
          ${preface ? `<h2>Preface</h2><div>${preface}</div>` : ''}
          ${chapter ? `<h2>Chapter</h2><div>${chapter}</div>` : ''}
          ${afterword ? `<h2>Afterword</h2><div>${afterword}</div>` : ''}
        </body>
      </html>
    `;

    res.send(pageHtml);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = { router };
