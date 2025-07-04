const express = require('express');
const path = require('path');

const { db } = require('./database');
const { router: userRoutes, authenticateToken } = require('./routes/users');
const { router: syosetuRoutes } = require('./routes/syosetu');
const { router: novelRoutes } = require('./routes/novels');

const app = express();
const port = 3000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/syosetu', syosetuRoutes);
app.use('/api/novels', novelRoutes);

// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, './login.html'));
// });
//
// app.get('/dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, './dashboard.html'));
// });
//
// app.get('/lookup', (req, res) => {
//   res.sendFile(path.join(__dirname, './novel_lookup.html'));
// });
//
// app.get('/tracker', (req, res) => {
//   res.sendFile(path.join(__dirname, './tracking.html'));
// });


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
