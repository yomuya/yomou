package main

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/mattn/go-sqlite3"
)

type SQLiteStore struct {
	db *sql.DB
}

func NewSQLiteStore(dbPath string) (*SQLiteStore, error) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("could not open database: %w", err)
	}

	store := &SQLiteStore{db: db}
	if err := store.initialize(); err != nil {
		db.Close()
		return nil, err
	}

	return store, nil
}

func (s *SQLiteStore) initialize() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS logins (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS novels (
			ncode TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			author TEXT NOT NULL,
			total_chapters INTEGER NOT NULL,
			last_checked DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS user_novel_follows (
			user_id INTEGER NOT NULL,
			ncode TEXT NOT NULL,
			current_chapter INTEGER DEFAULT 1,
			PRIMARY KEY (user_id, ncode),
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (ncode) REFERENCES novels(ncode)
		)`,
		`CREATE TABLE IF NOT EXISTS user_stats (
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
		)`,
		`DROP TABLE IF EXISTS chapters`,
	}

	for _, query := range queries {
		if _, err := s.db.Exec(query); err != nil {
			return fmt.Errorf("failed to execute query: %w", err)
		}
	}

	return nil
}

func (s *SQLiteStore) Close() error {
	return s.db.Close()
}

func (s *SQLiteStore) AllNovels() []Novel {
	rows, err := s.db.Query(`
		SELECT ncode, title, author, total_chapters, last_checked 
		FROM novels
	`)
	if err != nil {
		return []Novel{}
	}
	defer rows.Close()

	var novels []Novel
	for rows.Next() {
		var n Novel
		var ncode, title, author string
		var totalChapters int
		var lastChecked time.Time

		if err := rows.Scan(&ncode, &title, &author, &totalChapters, &lastChecked); err != nil {
			continue
		}

		n.Name = title
		novels = append(novels, n)
	}

	return novels
}

func (s *SQLiteStore) AddNovel(n Novel) (Novel, error) {
	_, err := s.db.Exec(`
		INSERT INTO novels (ncode, title, author, total_chapters)
		VALUES (?, ?, ?, ?)
	`, n.NCode, n.Title, n.Author, n.Total_Chapters)
	
	if err != nil {
		return Novel{}, fmt.Errorf("failed to add novel: %w", err)
	}

	return n, nil
}

func (s *SQLiteStore) FindNovel(name string) (Novel, bool, error) {
	var n Novel
	var title string

	err := s.db.QueryRow(`
		SELECT title FROM novels 
		WHERE title = ? OR ncode = ?
	`, name, name).Scan(&title)

	if err == sql.ErrNoRows {
		return Novel{}, false, nil
	}
	if err != nil {
		return Novel{}, false, fmt.Errorf("failed to find novel: %w", err)
	}

	n.Title = title
	return n, true, nil
}

// Chapter implementation (placeholder)
func (s *SQLiteStore) AllChapters() []Chapter {
	return []Chapter{}
}

func (s *SQLiteStore) AddChapter(c Chapter) (Chapter, error) {
	return c, fmt.Errorf("chapters table no longer exists")
}

func (s *SQLiteStore) FindChapter(name string) (Chapter, bool, error) {
	return Chapter{}, false, fmt.Errorf("chapters table no longer exists")
}
