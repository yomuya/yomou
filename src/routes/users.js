const express = require('express');
const router = express.Router();
const { db } = require('../database');

require('dotenv').config();

// POST /api/users
router.post('/', (req, res) => {
  const { name, pass, email } = req.body;
  const query = 'INSERT INTO users (name, password, email) VALUES (?, ?, ?)';
  db.run(
    query,
    [name, pass, email],
    function(err) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, name, email });
      }
    }
  );
});

// GET /api/users
router.get('/', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM users';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
  const { user, password } = req.body;
  const query = 'SELECT * FROM users WHERE (name = ? OR email = ?) AND password = ?';
  db.get(query, [user, user, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      const token = jwt.sign(
        { id: row.id, name: row.name, email: row.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token, user: { id: row.id, name: row.name, email: row.email } });
    } else {
      res.status(401).json({ error: 'User not found or password incorrect' });
    }
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = {
  router,
  authenticateToken
};
