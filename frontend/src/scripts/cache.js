import { authFetch } from '../auth.js';

export function setNcodeChapter(ncode, chapter) {
  if (ncode) {
    localStorage.setItem(`${ncode}_chapter`, chapter);
  }
}


export async function initializeChapter(ncode, chapter) {
  const chapterKey = `${ncode}_chapter`;
  const stored = localStorage.getItem(chapterKey);
  if (stored) {
    chapter = Number(stored);
  } else {
    // fallback: fetch current_chapter from backend
    const res = await authFetch(`/api/novels/${ncode}`);
    if (res.ok) {
      const novel = await res.json();
      chapter = novel.current_chapter || 1;
      localStorage.setItem(chapterKey, chapter);
    } else {
      chapter = 1;
    }
  }
  return chapter;
}

export function setNcodeTotalChapters(ncode, totalChapters) {
  if (ncode) {
    localStorage.setItem(`${ncode}_totalChapters`, totalChapters);
  }
}

export async function initializeTotalChapters(ncode) {
  const key = `${ncode}_totalChapters`;
  const stored = localStorage.getItem(key);
  if (stored) {
    return Number(stored);
  } else {
    // fallback: fetch from backend
    const res = await authFetch(`/api/novels/${ncode}`);
    if (res.ok) {
      const novel = await res.json();
      const total = novel.total_chapters || 1;
      localStorage.setItem(key, total);
      return total;
    } else {
      return 1;
    }
  }
}


