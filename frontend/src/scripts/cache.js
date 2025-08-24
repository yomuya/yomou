import { authFetch } from '../auth.js';

function openNovelDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('NovelDB', 4);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('chapters')) {
        db.createObjectStore('chapters', { keyPath: ['ncode', 'chapterNum'] });
      }
      if (!db.objectStoreNames.contains('NovelData')) {
        db.createObjectStore('NovelData', { keyPath: 'ncode' });
      }
    };
    request.onsuccess = async function (event) {
      const db = event.target.result;
      if (import.meta.env.VITE_STATIC !== 'true') {
        const tx = db.transaction('NovelData', 'readwrite');
        const store = tx.objectStore('NovelData');
        const countReq = store.count();
        countReq.onsuccess = async () => {
          if (countReq.result === 0) {
            try {
              const res = await authFetch(`/api/novels/follow/with-progress`);
              const data = await res.json();
              if (Array.isArray(data)) {
                const tx2 = db.transaction('NovelData', 'readwrite');
                const store2 = tx2.objectStore('NovelData');
                data.forEach(row => {
                  store2.put(row); 
                  console.log(row);
                });
                tx2.oncomplete = () => {};
                tx2.onerror = (e) => {
                  console.error('Failed to write NovelData:', e);
                };
              }
            } catch (e) {
              console.error('Failed to populate NovelData:', e);
            }
          }
        };
      }
      resolve(db);
    };
    request.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

export async function saveToIndexedDB(storeName, data) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFromIndexedDB(storeName, key) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result : null);
    req.onerror = () => resolve(null);
  });
}

export async function getAllFromIndexedDB(storeName, filterFn = null, sortFn = null) {
  const db = await openNovelDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => {
      let results = req.result || [];
      if (filterFn) {
        results = results.filter(filterFn);
      }
      if (sortFn) {
        results = results.sort(sortFn);
      }
      resolve(results);
    };
    req.onerror = () => reject(req.error);
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
  let state = NovelStateExists();
  if (!state[ncode]) 
    state[ncode] = {};

  if (state[ncode].current_chapter != Number(chapter)) state[ncode].current_chapter = Number(chapter);
  if (state[ncode].total_chapters != Number(totalChapters)) state[ncode].total_chapters = Number(totalChapters)

  localStorage.setItem('novel-state', JSON.stringify(state));

  const novel = await getFromIndexedDB('NovelData', ncode);
  console.log(novel);
  novel.current_chapter = Number(chapter);
  novel.total_chapters = Number(totalChapters);
  console.log('Saving updated novel to IndexedDB:', novel); // Add this for debugging
  await saveToIndexedDB('NovelData', novel);
}

export async function setNovel(novel) {
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
  let state = NovelStateExists();
  if (state && state[ncode]) {
    return state[ncode];
  }
  return null;
}



