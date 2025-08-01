<script setup>
import { ref, onMounted } from 'vue'
import { SettingsExists, saveTheme, getTheme } from '../scripts/settings.js'

const emit = defineEmits(['close'])
const settings = ref({
  theme: '',
})
const themes = ref([])
const selectedTheme = ref('')

onMounted(async () => {
  // Load available themes
  const db = await window.indexedDB.open('SettingsDB', 2)
  db.onsuccess = function (event) {
    const database = event.target.result
    const tx = database.transaction('themes', 'readonly')
    const store = tx.objectStore('themes')
    const req = store.getAll()
    req.onsuccess = () => {
      themes.value = req.result.map(t => t.theme)
    }
  }
  // Load current settings if exist
  const s = await SettingsExists()
  if (s.reader) {
    Object.assign(settings.value, s.reader)
    if (settings.value['font-size']) settings.value['font-size'] = parseInt(settings.value['font-size'])
    if (settings.value['max-width']) settings.value['max-width'] = parseInt(settings.value['max-width'])
  }
})

async function loadTheme() {
  if (!selectedTheme.value) return
  const themeObj = await getTheme(selectedTheme.value)
  if (themeObj) {
    Object.assign(settings.value, themeObj)
    if (settings.value['reader-font-size']) settings.value['reader-font-size'] = parseInt(settings.value['reader-font-size'])
    if (settings.value['reader-max-width']) settings.value['reader-max-width'] = parseInt(settings.value['reader-max-width'])
  }
}

function handleSaveTheme() {
  saveTheme({ ...settings.value })
}

function handleDialogClick(e) {
  if (e.target === e.currentTarget) emit('close')
}

function update() {
  const settingsCopy = { 
    ...settings.value, 
    'font-size': settings.value['font-size'] + 'px',
    'max-width': settings.value['max-width'] + 'vw',
  }
}
</script>

<template>
  <div class="reader-settings-dialog-overlay" @click="handleDialogClick">
    <div class="reader-settings-card">
      <div class="setting-row">
        <label for="theme-select">Load Theme:</label>
        <select id="theme-select" v-model="selectedTheme" @change="loadTheme">
          <option value="">-- Select Theme --</option>
          <option v-for="theme in themes" :key="theme" :value="theme">{{ theme }}</option>
        </select>
      </div>
      <form @submit.prevent>
        <div class="setting-row">
          <label for="theme">Theme Name:</label>
          <input id="theme" type="text" v-model="settings.theme" @input="update" />
        </div>
        <div class="setting-row">
          <label for="base-theme">Base Theme:</label>
          <select id="base-theme" v-model="settings['base-theme']" @change="update">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div class="setting-row">
          <label for="reader-font-size">Font Size: </label>
          <input id="reader-font-size" type="number" min="10" max="32" v-model.number="settings['reader-font-size']" @input="update" /> px
        </div>
        <div class="setting-row">
          <label for="reader-max-width">Max Width: </label>
          <input id="reader-max-width" type="number" min="50" max="100" v-model="settings['reader-max-width']" @input="update" /> vw
        </div>
        <div class="setting-row">
          <label for="reader-bg-color">BG color: </label>
          <input id="reader-bg-color" type="color" v-model="settings['reader-bg-color']" @input="update" />
        </div>
        <div class="setting-row">
          <label for="reader-text-color">Text Color: </label>
          <input id="reader-text-color" type="color" v-model="settings['reader-text-color']" @input="update" />
        </div>
        <div class="dialog-actions">
          <button type="button" @click="handleSaveTheme">Save Theme</button>
          <button type="button" @click="$emit('close')">Close</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.reader-settings-dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reader-settings-card {
  background: var(--settings-dialog-bg,#23272e);
  color: var(--settings-dialog-color,#f5f6fa);
  border-radius: 10px;
  padding: 2em;
  min-width: 340px;
  box-shadow: 0 2px 24px #0008;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.setting-row {
  margin-bottom: 1em;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.setting-row label {
  margin-bottom: 0.3em;
  font-weight: 500;
}
.dialog-actions {
  margin-top: 2em;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  gap: 1em;
}
.dialog-actions button {
  padding: 0.6em 2em;
  font-size: 1em;
  border-radius: 6px;
  background: var(--reader-btn-bg,#23272e);
  color: var(--reader-btn-color,#f5f6fa);
  border: 1px solid #31343b;
}
</style>
