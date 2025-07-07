const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authenticateToken } = require('./users');

router.get('/', authenticateToken, async (req, res) => { 
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
  const chapter = req.body.chapter ? req.body.chapter : 1;
  if (!ncode) {
    return res.status(400).json({ error: 'ncode required' });
  }

  try {
    const response = await fetch(`https://api.syosetu.com/novelapi/api/?ncode=${ncode}&out=json`);
    const data = await response.json(); // ✅ now data is defined

    if (Array.isArray(data) && data[1] && data[1].ncode && data[1].title && data[1].writer && data[1].general_all_no) {
      const { ncode, title, writer, general_all_no } = data[1];

      db.run(
        `INSERT OR REPLACE INTO novels (ncode, title, author, total_chapters)
         VALUES (?, ?, ?, ?)`,
        [ncode, title, writer, general_all_no]
      );

      db.run(
        `INSERT INTO user_novel_follows (user_id, ncode, current_chapter)
         VALUES (?, ?, ?)
         ON CONFLICT(user_id, ncode) DO UPDATE SET current_chapter=excluded.current_chapter`,
        [userId, ncode, chapter],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({ success: true, followed: ncode });
          }
        }
      );
    } else {
      res.status(404).json({ error: 'Novel not found in Syosetu API' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch novel info' });
  }
});

module.exports = { router };
