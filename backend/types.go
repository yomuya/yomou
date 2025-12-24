package main

type Novel struct {
	NCode string
	Title string
	Author string
	Total_Chapters int
}

type Chapter struct {
	NCode string
	Title string
	Author string
	Total_Chapters int
}

type Store interface {
	initialize() error

	AllNovels() []Novel
	AddNovel(Novel) (Novel, error)
	FindNovel(name string) (Novel, bool, error)

	AllChapters() []Chapter
	AddChapter(Chapter) (Chapter, error)
	FindChapter(name string) (Chapter, bool, error)
}

