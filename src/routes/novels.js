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
        res.json(rows);
      }
    }
  );
});

router.get('/follow/with-progress', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  db.all(
    `SELECT user_novel_follows.ncode, user_novel_follows.current_chapter, novels.title, novels.author, novels.total_chapters, novels.last_checked
     FROM user_novel_follows
     JOIN novels ON user_novel_follows.ncode = novels.ncode
     WHERE user_novel_follows.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

router.post('/follow', authenticateToken, async (req, res) => { 
  const userId = req.user.id;
  const ncode = req.body && req.body.ncode ? req.body.ncode.toLowerCase() : undefined;
  const chapter = req.body.chapter ? req.body.chapter : 1;
  if (!ncode) {
    return res.status(400).json({ error: 'ncode required' });
  }

  try {
    const response = await fetch(`https://api.syosetu.com/novelapi/api/?ncode=${ncode}&out=json`);
    const data = await response.json();

    if (Array.isArray(data) && data[1] && data[1].ncode && data[1].title && data[1].writer && data[1].general_all_no) {
      const { title, writer, general_all_no } = data[1];

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
            res.json({ success: true, followed: ncode, chapter: chapter });
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

async function updateNovelsByNcodes(ncodes) {
  if (!ncodes || !Array.isArray(ncodes) || ncodes.length === 0) {
    return [];
  }
  ncodes = ncodes.map(n => n.toLowerCase());
  const combinedNcodes = ncodes.join('-');
  try {
    const response = await fetch(`https://api.syosetu.com/novelapi/api/?ncode=${combinedNcodes}&out=json`);
    const data = await response.json();
    const updated = [];
    for (let i = 1; i < data.length; i++) {
      const novel = data[i];
      if (novel.ncode && novel.title && novel.writer && novel.general_all_no) {
        db.run(
          `INSERT OR REPLACE INTO novels (ncode, title, author, total_chapters, last_checked)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [novel.ncode.toLowerCase(), novel.title, novel.writer, novel.general_all_no]
        );
        updated.push({
          ncode: novel.ncode.toLowerCase(),
          title: novel.title,
          author: novel.writer,
          total_chapters: novel.general_all_no,
          link: `https://ncode.syosetu.com/${novel.ncode.toLowerCase()}`
        });
      }
    }
    return updated;
  } catch (err) {
    return [];
  }
}

let lastUpdateTime = 0;
let minutes = 10;

router.post('/update', authenticateToken, async (req, res) => {
  const now = Date.now();
  if (now - lastUpdateTime < minutes * 60 * 1000) {
    return res.status(429).json({ error: 'Updated within the last 10 minutes.' });
  }
  lastUpdateTime = now;

  let ncodes = req.body.ncodes;
  if (!ncodes || !Array.isArray(ncodes) || ncodes.length === 0) {
    return res.status(400).json({ error: 'ncodes (array) required' });
  }
  const updated = await updateNovelsByNcodes(ncodes);
  res.json({ updated });
});

function runRoutineUpdate() {
  const now = Date.now();
  if (now - lastUpdateTime < minutes * 60 * 1000) {
    return;
  }
  lastUpdateTime = now;
  db.all('SELECT ncode FROM novels', async (err, rows) => {
    if (!err && rows && rows.length > 0) {
      const ncodes = rows.map(r => r.ncode);
      await updateNovelsByNcodes(ncodes);
    }
  });
}

const updatePeriod = process.env.NOVEL_UPDATE_MINUTES ? parseInt(process.env.NOVEL_UPDATE_MINUTES, 10) : 60;
const now = new Date();
const msToNextPeriod = (updatePeriod - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

setTimeout(() => {
  runRoutineUpdate();
  setInterval(runRoutineUpdate, updatePeriod * 60 * 1000);
}, msToNextPeriod);


router.get('/:ncode', authenticateToken, async (req, res) => { 
  const userId = req.user.id;
  const ncode = req.params.ncode ? req.params.ncode.toLowerCase() : undefined;
  if (!ncode) {
    return res.status(400).json({ error: 'ncode required' });
  }
  db.get(
    `SELECT user_novel_follows.*, novels.*
     FROM user_novel_follows
     JOIN novels ON user_novel_follows.ncode = novels.ncode
     WHERE user_novel_follows.user_id = ? AND novels.ncode = ?`,
    [userId, ncode],
    (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});


module.exports = { router };
