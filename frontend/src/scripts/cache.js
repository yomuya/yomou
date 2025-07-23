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

export async function removeChapterFromIndexedDB(ncode, chapterNum) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chapters', 'readwrite');
    const store = tx.objectStore('chapters');
    const req = store.delete([ncode, Number(chapterNum)]);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function removeChaptersFromIndexedDB(ncode, chapterNums) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chapters', 'readwrite');
    const store = tx.objectStore('chapters');
    let completed = 0;
    let hasError = false;
    chapterNums.forEach(chapterNum => {
      const req = store.delete([ncode, Number(chapterNum)]);
      req.onsuccess = () => {
        completed++;
        if (completed === chapterNums.length && !hasError) resolve();
      };
      req.onerror = () => {
        hasError = true;
        reject(req.error);
      };
    });
    if (chapterNums.length === 0) resolve();
  });
}

function NovelStateExists() {
  try {
    return JSON.parse(localStorage.getItem('novel-state')) || {};
  } catch {
    return {};
  }
}

export async function setNovelProgress(ncode, chapter, totalChapters) {
  migrateNovelState();
  let state = NovelStateExists();
  if (!state[ncode]) 
    state[ncode] = {};

  if (state[ncode].current_chapter != Number(chapter)) state[ncode].current_chapter = Number(chapter);
  if (state[ncode].total_chapters != Number(totalChapters)) state[ncode].total_chapters = Number(totalChapters)

  localStorage.setItem('novel-state', JSON.stringify(state));
}

export async function setNovel(novel) {
  migrateNovelState();
  let ncode = novel.ncode;
  let state = NovelStateExists();
  if (!state[ncode]) state[ncode] = {};
  state[ncode] = {
    ncode: novel.ncode,
    title: novel.title,
    author: novel.author,
    current_chapter: novel.current_chapter,
    total_chapters: novel.total_chapters,
    last_checked: novel.last_checked,
    last_cached: new Date().toISOString()
  };
  localStorage.setItem('novel-state', JSON.stringify(state));
}

export async function getNovel(ncode) {
  migrateNovelState();
  let state = NovelStateExists();
  if (state && state[ncode]) {
    return state[ncode];
  }
  return null;
}

function migrateNovelState() {
  try {
    const keys = Object.keys(localStorage);
    let migrated = false;
    let state = NovelStateExists();
    keys.forEach(key => {
      if (key.startsWith('novel-progress-') && key !== 'novel-progress') {
        const ncode = key.replace('novel-progress-', '');
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && typeof data.chapter !== 'undefined' && typeof data.totalChapters !== 'undefined') {
            if (!state[ncode]) state[ncode] = {};
            state[ncode].progress = { chapter: Number(data.chapter), totalChapters: Number(data.totalChapters) };
            migrated = true;
            localStorage.removeItem(key);
          }
        } catch {
        }
      }
    });
    if (migrated) {
      localStorage.setItem('novel-state', JSON.stringify(state));
    }
  } catch {
  }
}


