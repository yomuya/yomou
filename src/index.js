const express = require('express');
const path = require('path');

const { db } = require('./database');
const { router: userRoutes, authenticateToken } = require('./routes/users');
const { router: syosetuRoutes } = require('./routes/syosetu');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/syosetu', syosetuRoutes);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/lookup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/novel_lookup.html'));
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
