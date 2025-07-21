const express = require('express');
const path = require('path');

const { db } = require('./database');
const { router: userRoutes, authenticateToken } = require('./routes/users');
const { router: syosetuRoutes } = require('./routes/syosetu');
const { router: novelRoutes } = require('./routes/novels');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/syosetu', syosetuRoutes);
app.use('/api/novels', novelRoutes);

// if (process.env.NODE_ENV === 'production') {
if (require('fs').existsSync(path.join(__dirname, '../frontend/dist'))) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}
// }



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
