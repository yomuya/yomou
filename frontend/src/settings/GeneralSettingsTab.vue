<script setup>
import { ref, onMounted } from 'vue'
import { SettingsExists, setGeneralSettings } from '../scripts/settings.js'

const general = ref({})

onMounted(async () => {
  const settings = await SettingsExists()
  general.value = settings.general || {}
})

function save() {
  setGeneralSettings(general.value)
}
</script>

<template>
  <div>
    <h2>General Settings</h2>
    <label>
      Example General Setting:
      <input v-model="general.example" placeholder="Example General Setting" />
    </label>
    <button @click="save">Save</button>
  </div>
</template>
