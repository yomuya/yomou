import { ref } from 'vue';
import { authFetch } from '../auth.js';
import { setNovelProgress, getFromIndexedDB, getAllFromIndexedDB, saveToIndexedDB, getAllChaptersFromIndexedDB } from './cache.js';
import { scrape } from './scrape.js';



export async function fetchNovel(ncode) {
  const novels = await getFromIndexedDB('NovelData', ncode);
  if (novels) {
    return novels;
  }
  if (import.meta.env.VITE_STATIC === 'true') {
    console.log("No novels available")
    return {};
  }

  const res = await authFetch(`/api/novels/${ncode}`);
  return await res.json();
}

export async function fetchNovelToC(ncode, order = 'asc') {
  // some magic sorting function :)
  const sortFn = order === 'desc'
    ? (a, b) => b.chapterNum - a.chapterNum
    : (a, b) => a.chapterNum - b.chapterNum;
  const chapters = await getAllFromIndexedDB('chapters', ch => ch.ncode === ncode, sortFn);
  return chapters;
}


export async function loadFollows() {
  const follows = await getAllFromIndexedDB('NovelData');
  if (follows && Array.isArray(follows) && follows.length > 0) {
    return ref(follows);
  }
  if (import.meta.env.VITE_STATIC === 'true') {
    console.log("No followed novels available");
    return ref([]);
  }
  const trackedNovels = ref([]);
  try {
    const res = await authFetch('/api/novels/follow');
    if (res.status === 401 || res.status === 403) {
      trackedNovels.value = [];
    } else {
      const data = await res.json();
      trackedNovels.value = data;
      const novels = data.map(({ user_id, ...rest }) => rest);
      for (const novel of novels) {
        await saveToIndexedDB('NovelData', novel);
      }
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
    let chapter = await getFromIndexedDB('chapters', [ncode, Number(chapterNum)]);
    if (chapter) {
      return chapter;
    }
    console.log('Fetching from API:', `/api/novels/${ncode}/${chapterNum}`);
    chapter = await scrape(ncode, chapterNum);
    if (chapter) {
      const cached = await getFromIndexedDB('chapters', [ncode, Number(chapterNum)]);
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


