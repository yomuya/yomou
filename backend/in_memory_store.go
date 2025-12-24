package main

type InMemoryStore struct {
	novels []Novel
	chapters []Chapter
}

func (i *InMemoryStore) AllNovels() []Novel {
	return i.novels
}
func (i *InMemoryStore) AddNovel(n Novel) (Novel, error) {
	
	i.novels = append(i.novels, n)
	return n, nil
}
func (i *InMemoryStore) FindNovelByName(name string) (Novel, bool, error){
	for _, n := range i.novels {
		if n.Name == name {
			return n, true, nil
		}
	}
	var zero Novel
	return zero, false, nil
}

func (i *InMemoryStore) AllChapters() []Chapter {
	return i.chapters
}
func (i *InMemoryStore) AddChapter(c Chapter) (Chapter, error) {
	
	i.chapters = append(i.chapters, c)
	return c, nil
}
func (i *InMemoryStore) FindByName(name string) (Chapter, bool, error){
	for _, c := range i.chapters {
		if c.Name == name {
			return c, true, nil
		}
	}
	var zero Chapter
	return zero, false, nil
}
