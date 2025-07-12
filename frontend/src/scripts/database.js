import { ref } from 'vue';
import { authFetch } from '../auth.js';

export async function fetchNovel(ncode) {
  const res = await authFetch(`/api/novels/${ncode}`);
  return await res.json();
}
// NAME TO BE CHANGED LATER
export async function fetchNovelToC(ncode) {
  const tocRes = await authFetch(`/api/novels/${ncode}/toc`);
  return await tocRes.json();
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

export async function fetchChapter(ncode, chapterNum, scrapeAheadCount = 1) {
  try {
    const res = await authFetch(`/api/syosetu/chapter?ncode=${ncode}&chapter=${chapterNum}`)
    if (res.ok) {
      const text = await res.text()
      return JSON.parse(text)
    } else if (res.status === 404) {
      // Try scraping if not found
      const scrapeRes = await authFetch(`/api/syosetu/scrape?ncode=${ncode}&chapter=${chapterNum}`)
      if (scrapeRes.ok) {
        // After scraping, try fetching again
        const retryRes = await authFetch(`/api/syosetu/chapter?ncode=${ncode}&chapter=${chapterNum}`)
        if (retryRes.ok) {
          const retryText = await retryRes.text()
          return JSON.parse(retryText)
        } else {
          return null
        }
      } else {
        return null
      }
    } else {
      return null
    }
  } catch (e) {
    console.error('Network error:', e)
    return null
  }
}

export async function updateCurrentChapter(ncode, chapter) {
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


