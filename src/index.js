const express = require('express');
const path = require('path');

const { db } = require('./database');
const { router: userRoutes, authenticateToken } = require('./routes/users');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use('/api/users', userRoutes);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/dashboard', (req, res) => {
// app.get('/dashboard', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
