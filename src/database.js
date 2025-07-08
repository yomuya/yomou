const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}
const db = new sqlite3.Database('data/database.db', (err) => {
  if (err) {
    console.error('Could not open database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS logins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS novels (
      ncode TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      total_chapters INTEGER NOT NULL,
      last_checked DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS chapters (
      ncode TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      title TEXT,
      length_chars INTEGER,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ncode, chapter_number),
      FOREIGN KEY (ncode) REFERENCES novels(ncode)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_novel_follows (
      user_id INTEGER NOT NULL,
      ncode TEXT NOT NULL,
      current_chapter INTEGER DEFAULT 1,
      PRIMARY KEY (user_id, ncode),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (ncode) REFERENCES novels(ncode)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id INTEGER NOT NULL,
      ncode TEXT NOT NULL,
      last_read_chapter INTEGER DEFAULT 0,
      is_favorite BOOLEAN DEFAULT 0,
      rating INTEGER CHECK(rating BETWEEN 1 AND 5),
      total_time_spent INTEGER DEFAULT 0,
      last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, ncode),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (ncode) REFERENCES novels(ncode)
    )
  `);
});

module.exports = {
  db
};
