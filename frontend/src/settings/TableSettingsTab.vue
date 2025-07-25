<script setup>
import { ref, onMounted } from 'vue'
import { SettingsExists, setTableSettings } from '../scripts/settings.js'

const table = ref({})

onMounted(async () => {
  const settings = await SettingsExists()
  table.value = settings.table || {}
})

function save() {
  setTableSettings(table.value)
}
</script>

<template>
  <div>
    <h2>Table Settings</h2>
    <label>
      Example Table Setting:
      <input v-model="table.example" placeholder="Example Table Setting" />
    </label>
    <button @click="save">Save</button>
  </div>
</template>
