
export async function SettingsExists() {
  try {
    let settings = JSON.parse(localStorage.getItem('userSettings'));
    if (settings = {}){
      setUserSettings(); 
      settings = JSON.parse(localStorage.getItem('userSettings'));
    }
    return settings;
  } catch {
    return {};
  }
}

export async function setUserSettings() {
  let settings = SettingsExists();
  if (!settings) 
    settings = {};

  settings = {
    general: {
    },
    table: {
    },
    navbar: {
    },
    reader: {
      theme: 'dark',
      "font-size": '16px',
      "max-width": '60vw',
      "btn-bg": '#23272e',
      "btn-color": '#f5f6fa',
      "btn-hover-bg": '#31343b',
      "input-bg": '#23272e',
      "input-color": '#f5f6fa',
      "settings-dialog-color": '#f5f6fa',
      "settings-dialog-bg": '#23272e'
    }
  };
  localStorage.setItem('userSettings', JSON.stringify(settings));
}

export async function setGeneralSettings(data) {
  const settings = SettingsExists();
  settings.general = data;
  localStorage.setItem('userSettings', JSON.stringify(settings));
  applyUserSettings(settings);
}
export async function setTableSettings(data) {
  const settings = SettingsExists();
  settings.table = data;
  localStorage.setItem('userSettings', JSON.stringify(settings));
  applyUserSettings(settings);
}
export async function setNavbarSettings(data) {
  const settings = SettingsExists();
  settings.navbar = data;
  localStorage.setItem('userSettings', JSON.stringify(settings));
  applyUserSettings(settings);
}
export async function setReaderSettings(data) {
  const settings = SettingsExists();
  settings.reader = data;
  localStorage.setItem('userSettings', JSON.stringify(settings));
  applyUserSettings(settings);
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
