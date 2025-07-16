import { authFetch } from '../auth.js';

function openNovelDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('NovelDB', 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('chapters')) {
        db.createObjectStore('chapters', { keyPath: ['ncode', 'chapterNum'] });
      }
    };
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

export async function saveChapterToIndexedDB(ncode, chapterNum, data) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chapters', 'readwrite');
    const store = tx.objectStore('chapters');
    store.put({ ncode, chapterNum: Number(chapterNum), ...data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getChapterFromIndexedDB(ncode, chapterNum) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chapters', 'readonly');
    const store = tx.objectStore('chapters');
    const req = store.get([ncode, Number(chapterNum)]);
    req.onsuccess = () => resolve(req.result ? req.result : null);
    req.onerror = () => resolve(null);
  });
}

export async function getAllChaptersFromIndexedDB(ncode) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chapters', 'readonly');
    const store = tx.objectStore('chapters');
    const req = store.getAll();
    req.onsuccess = () => {
      const chapters = req.result
        .filter(ch => ch.ncode === ncode)
        .sort((a, b) => a.chapterNum - b.chapterNum);
      resolve(chapters);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function setNovelProgress(ncode, chapter, totalChapters) {
  localStorage.setItem(
    `novel-progress-${ncode}`,
    JSON.stringify({ chapter: Number(chapter), totalChapters: Number(totalChapters) })
  );
}

export async function getNovelProgress(ncode) {
  const data = localStorage.getItem(`novel-progress-${ncode}`);
  if (data) {
    try {
      const obj = JSON.parse(data);
      return { chapter: obj.chapter, totalChapters: obj.totalChapters };
    } catch {
      return null;
    }
  }
  return null;
}

export async function initializeChapter(ncode, chapter) {
  const progress = await getNovelProgress(ncode);
  if (progress && progress.chapter) {
    chapter = Number(progress.chapter);
  } else {
    // fallback: fetch current_chapter from backend
    const res = await authFetch(`/api/novels/${ncode}`);
    if (res.ok) {
      const novel = await res.json();
      chapter = novel.current_chapter || 1;
      await setNovelProgress(ncode, Number(chapter), novel.total_chapters || 1);
    } else {
      chapter = 1;
    }
  }
  return Number(chapter);
}

export async function initializeTotalChapters(ncode) {
  const progress = await getNovelProgress(ncode);
  if (progress && progress.totalChapters) {
    return Number(progress.totalChapters);
  } else {
    // fallback: fetch from backend
    const res = await authFetch(`/api/novels/${ncode}`);
    if (res.ok) {
      const novel = await res.json();
      const total = novel.total_chapters || 1;
      await setNovelProgress(ncode, Number(novel.current_chapter) || 1, total);
      return total;
    } else {
      return 1;
    }
  }
}


