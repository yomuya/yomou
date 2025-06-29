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

router.get('/novels', authenticateToken, async (req, res) => { 
  db.all('SELECT * FROM novels', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

router.get('/follow', authenticateToken, async (req, res) => { 
  const userId = req.user.id;
  // const ncode = req.body && req.body.ncode ? req.body.ncode.toUpperCase() : undefined;
  db.all(
    `SELECT user_novel_follows.*, novels.*
     FROM user_novel_follows
     JOIN novels ON user_novel_follows.ncode = novels.ncode
     WHERE user_novel_follows.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // console.log(rows);
        res.json(rows);
      }
    }
  );
});

router.post('/follow', authenticateToken, async (req, res) => { 
  const userId = req.user.id;
  const ncode = req.body && req.body.ncode ? req.body.ncode.toUpperCase() : undefined;
  if (!ncode) {
    return res.status(400).json({ error: 'ncode required' });
  }
  db.run(
    `INSERT OR IGNORE INTO user_novel_follows (user_id, ncode) VALUES (?, ?)`,
    [userId, ncode],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true, followed: ncode });
      }
    }
  );
});

module.exports = { router };
