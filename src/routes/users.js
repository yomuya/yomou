const express = require('express');
const router = express.Router();
const { db } = require('../database');

require('dotenv').config();

// POST /api/users
router.post('/', (req, res) => {
  const { name, pass } = req.body;
  const bcrypt = require('bcryptjs');
  const saltRounds = 10;

  bcrypt.hash(pass, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }
    const query = 'INSERT INTO users (name, password) VALUES (?, ?)';
    db.run(
      query,
      [name, hash],
      function(err) {
        if (err) {
          res.status(400).json({ error: err.message });
        } else {
          res.json({ id: this.lastID, name });
        }
      }
    );
  });
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
  const bcrypt = require('bcryptjs');
  const query = 'SELECT * FROM users WHERE name = ?';
  db.get(query, [user], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      bcrypt.compare(password, row.password, (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Error comparing passwords' });
        } else if (result) {
          const token = jwt.sign(
            { id: row.id, name: row.name, email: row.email },
            JWT_SECRET,
            { expiresIn: '14d' }
          );
          res.json({ token, user: { id: row.id, name: row.name, email: row.email } });
        } else {
          res.status(401).json({ error: 'User not found or password incorrect' });
        }
      });
    } else {
      res.status(401).json({ error: 'User not found or password incorrect' });
    }
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

module.exports = {
  router,
  authenticateToken
};
