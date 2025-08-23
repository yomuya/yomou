function openSettingsDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('SettingsDB', 2);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('themes')) {
        db.createObjectStore('themes', { keyPath: 'theme' });
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

export async function SettingsExists() {
  try {
    let settings = localStorage.getItem('globalTheme');
    if (!settings) {  
      setUserSettings();
      localStorage.setItem('globalTheme', "dark");
      localStorage.setItem('readerTheme', "dark");
      settings = "dark";
    }
    return settings;
  } catch {
    return {};
  }
}

export async function overwriteTheme(data) {
  const db = await openSettingsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('themes', 'readwrite');
    const store = tx.objectStore('themes');
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveTheme(data) {
  const db = await openSettingsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('themes', 'readwrite');
    const store = tx.objectStore('themes');
    const getReq = store.get(data.theme);
    getReq.onsuccess = () => {
      if (getReq.result) {
        resolve(false); // Do not overwrite
      } else {
        store.add(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function getTheme(themeName) {
  const db = await openSettingsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('themes', 'readonly');
    const store = tx.objectStore('themes');
    const req = store.get(themeName);
    req.onsuccess = () => resolve(req.result ? req.result : null);
    req.onerror = () => resolve(null);
  });
}

export async function setUserSettings() {
  SettingsExists();
  const settings = [
    {
      theme: 'dark',
      "base-theme": 'dark',
      "reader-font-size": '16px',
      "reader-max-width": '60vw',
      "reader-bg-color": '#181a1b',
      "reader-text-color": '#f4f4f4',
    },
    {
      theme: 'light',
      "base-theme": 'light',
      "reader-font-size": '16px',
      "reader-max-width": '60vw',
      "reader-bg-color": '#ffffff',
      "reader-text-color": '#333333',
    }
  ];
  for (const theme of settings) {
    await overwriteTheme(theme);
  }
}

export async function applyTheme(themeName) {
  try {
    const theme = await getTheme(themeName);
    if (theme) {
      document.documentElement.style.setProperty('--reader-font-size', theme['reader-font-size']);
      document.documentElement.style.setProperty('--reader-max-width', theme['reader-max-width']);
      document.documentElement.style.setProperty('--reader-bg-color', theme['reader-bg-color']);
      document.documentElement.style.setProperty('--reader-text-color', theme['reader-text-color']);
    }
    document.documentElement.setAttribute('data-theme', theme['base-theme']);
    console.log('Theme switched to: ', themeName);
  } catch (e) {
    console.error('Failed to apply theme:', e);
  }
}

export async function changeTheme(themeName) {
  const theme = await getTheme(themeName);
  localStorage.setItem('globalTheme', theme['base-theme']);
  localStorage.setItem('readerTheme', themeName);
  applyTheme(themeName);
  
}

export async function applyUserSettings(settings) {
  Object.entries(settings).forEach(([section, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${section}-${key}`, value);
      });
    }
  });
}
