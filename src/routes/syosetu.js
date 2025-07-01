const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { authenticateToken } = require('./users');

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

    if (Array.isArray(data) && data[1] && data[1].ncode && data[1].title && data[1].writer && data[1].general_all_no) {
      const { ncode, title, writer, general_all_no } = data[1];
      db.run(
        `INSERT OR REPLACE INTO novels (ncode, title, author, total_chapters)
         VALUES (?, ?, ?, ?)`,
        [ncode, title, writer, general_all_no]
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = { router };
