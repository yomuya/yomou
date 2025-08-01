<script setup>
import { ref, onMounted } from 'vue'
import ReaderSettingsTab from './settings/ReaderSettingsTab.vue'
import { getTheme, applyTheme } from './scripts/settings.js'

const tabs = [
  { key: 'reader', label: 'Reader', component: ReaderSettingsTab },
]
const activeTab = ref('reader')

const themes = ref([])
const showThemeDialog = ref(false)

async function loadThemes() {
  // IndexedDB doesn't support listing keys directly, so we use getAll
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
}
onMounted(loadThemes)

function openThemeDialog() {
  showThemeDialog.value = true
}
function closeThemeDialog() {
  showThemeDialog.value = false
  loadThemes()
}
</script>

<template>
  <div>
    <div style="margin:1em 0;">
      <h3>Themes</h3>
      <ul>
        <li v-for="theme in themes" :key="theme" style="margin-bottom:0.5em;">
          <span>{{ theme }}</span>
          <button @click="applyTheme(theme)" style="margin-left:1em;">Select</button>
        </li>
      </ul>
      <button @click="openThemeDialog">Create New Theme</button>
    </div>
    <div v-if="showThemeDialog">
      <ReaderSettingsTab @close="closeThemeDialog" />
    </div>
  </div>
</template>
