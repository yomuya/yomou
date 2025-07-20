import { ref } from 'vue';
import { authFetch } from '../auth.js';
import { setNovelProgress, getChapterFromIndexedDB, saveChapterToIndexedDB, getAllChaptersFromIndexedDB } from './cache.js'
import { scrape } from './scrape.js';

export async function fetchNovel(ncode) {
  const res = await authFetch(`/api/novels/${ncode}`);
  return await res.json();
}

export async function fetchNovelToC(ncode) {
  const chapters = await getAllChaptersFromIndexedDB(ncode);
  return chapters;
}


export async function loadFollows() {
  const trackedNovels = ref([]);
  try {
    const res = await authFetch('/api/novels/follow');
    if (res.status === 401 || res.status === 403) {
      trackedNovels.value = [];
    } else {
      trackedNovels.value = await res.json();
    }
  } catch (e) {
    trackedNovels.value = [];
    console.error('Failed to load follows', e);
  }
  return trackedNovels;
}

export async function fetchChapter(ncode, chapterNum) {
  try {
    if (!ncode || !chapterNum) {
      return null;
    }
    let chapter = await getChapterFromIndexedDB(ncode, Number(chapterNum));
    if (chapter) {
      return chapter;
    }
    chapter = await scrape(ncode, chapterNum);
    if (chapter) {
      const cached = await getChapterFromIndexedDB(ncode, Number(chapterNum));
      return cached || chapter;
    }
    return null;
  } catch (e) {
    console.error('Network error:', e)
    return null
  }
}

export async function updateCurrentChapter(ncode, chapter, totalChapters) {
  await authFetch('/api/novels/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode: ncode, chapter: chapter })
  });
  await setNovelProgress(ncode, chapter, totalChapters);
}

export async function followNovel(ncode) {
  const res = await authFetch(`/api/novels/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode: ncode })
  });
  return await res.text();
}


