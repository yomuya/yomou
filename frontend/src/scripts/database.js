import { ref } from 'vue';
import { authFetch } from '../auth.js';
import { setNovelProgress, getChapterFromIndexedDB, saveChapterToIndexedDB, getAllChaptersFromIndexedDB } from './cache.js'

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
    const chapter = await getChapterFromIndexedDB(ncode, Number(chapterNum));
    if (chapter) {
      return chapter;
    }
    const res = await authFetch(`/api/syosetu/scrape?ncode=${ncode}&chapter=${Number(chapterNum)}`, { method: 'POST' })
    if (res.ok) {
      const text = await res.text()
      const chapterData = JSON.parse(text)
      await saveChapterToIndexedDB(ncode, Number(chapterNum), chapterData);
      return chapterData
    } 
    else {
      return null
    }
  } catch (e) {
    console.error('Network error:', e)
    return null
  }
}

export async function updateCurrentChapter(ncode, chapter, totalChapters) {
  await setNovelProgress(ncode, chapter, totalChapters);
  await authFetch('/api/novels/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode: ncode, chapter: chapter })
  });
}

export async function followNovel(ncode) {
  const res = await authFetch(`/api/novels/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode: ncode })
  });
  return await res.text();
}


