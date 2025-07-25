<script setup>
import { ref, onMounted } from 'vue'
import { SettingsExists, setReaderSettings } from '../scripts/settings.js'

const settings = ref({
})

onMounted(async () => {
  const s = await SettingsExists()
  if (s.reader) {
    Object.assign(settings.value, s.reader)
    if (settings.value['font-size']) settings.value['font-size'] = parseInt(settings.value['font-size'])
    if (settings.value['max-width']) settings.value['max-width'] = parseInt(settings.value['max-width'])
  }
})

function update() {
  const settingsCopy = { 
    ...settings.value, 
    'font-size': settings.value['font-size'] + 'px',
    'max-width': settings.value['max-width'] + 'vw',
  }
  setReaderSettings(settingsCopy)
}
</script>

<template>
  <div class="reader-settings-card">
    <h2>Reader Settings</h2>
    <form @submit.prevent>
      <div class="setting-row">
        <label for="theme">Theme:</label>
        <select id="theme" v-model="settings.theme" @change="update">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div class="setting-row">
        <label for="font-size">Font Size: </label>
        <input id="font-size" type="number" min="10" max="32" v-model.number="settings['font-size']" @input="update" /> px
      </div>
      <div class="setting-row">
        <label for="max-width">Max Width: </label>
        <input id="max-width" type="number" min="50" max="100" v-model="settings['max-width']" @input="update" /> vw
      </div>
      <div class="setting-row">
        <label for="btn-bg">Button BG: </label>
        <input id="btn-bg" type="color" v-model="settings['btn-bg']" @input="update" />
      </div>
      <div class="setting-row">
        <label for="btn-color">Button Color: </label>
        <input id="btn-color" type="color" v-model="settings['btn-color']" @input="update" />
      </div>
      <div class="setting-row">
        <label for="btn-hover-bg">Button Hover BG: </label>
        <input id="btn-hover-bg" type="color" v-model="settings['btn-hover-bg']" @input="update" />
      </div>
      <div class="setting-row">
        <label for="input-bg">Input BG: </label>
        <input id="input-bg" type="color" v-model="settings['input-bg']" @input="update" />
      </div>
      <div class="setting-row">
        <label for="input-color">Input Color: </label>
        <input id="input-color" type="color" v-model="settings['input-color']" @input="update" />
      </div>
      <div class="setting-row">
        <label for="settings-dialog-bg">Settings BG: </label>
        <input id="settings-dialog-bg" type="color" v-model="settings['settings-dialog-bg']" @input="update" />
      </div>
      <div class="setting-row">
        <label for="settings-dialog-color">Settings Text: </label>
        <input id="settings-dialog-color" type="color" v-model="settings['settings-dialog-color']" @input="update" />
      </div>
      <div style="margin-top:2em;text-align:center;">
        <button type="button" @click="$emit('close')" style="padding:0.6em 2em;font-size:1em;border-radius:6px;background:var(--reader-btn-bg,#23272e);color:var(--reader-btn-color,#f5f6fa);border:1px solid #31343b;">Close</button>
      </div>
    </form>
  </div>
</template>
