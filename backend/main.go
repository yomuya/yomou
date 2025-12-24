package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	port := "3000"

	store, err := NewSQLiteStore("data/database.db")
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer store.Close()

	mux := newRouter()

	log.Printf("Server running at http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func newRouter() http.Handler {
	r := http.NewServeMux()

	// API routes (to add later):
	// r.Handle("/api/users", userHandler(store))
	// r.Handle("/api/syosetu", syosetuHandler(store))
	// r.Handle("/api/novels", novelHandler(store))

	frontendDist := filepath.Join(".", "frontend", "dist")
	if _, err := os.Stat(frontendDist); err == nil {
		fs := http.FileServer(http.Dir(frontendDist))

		r.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			path := filepath.Join(frontendDist, r.URL.Path)
			if _, err := os.Stat(path); os.IsNotExist(err) && r.URL.Path != "/" {
				http.ServeFile(w, r, filepath.Join(frontendDist, "index.html"))
				return
			}
			fs.ServeHTTP(w, r)
		}))
	}

	return r
}
