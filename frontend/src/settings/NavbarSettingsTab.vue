<script setup>
import { ref, onMounted } from 'vue'
import { SettingsExists, setNavbarSettings } from '../scripts/settings.js'

const navbar = ref({})

onMounted(async () => {
  const settings = await SettingsExists()
  navbar.value = settings.navbar || {}
})

function save() {
  setNavbarSettings(navbar.value)
}
</script>

<template>
  <div>
    <h2>Navbar Settings</h2>
    <label>
      Example Navbar Setting:
      <input v-model="navbar.example" placeholder="Example Navbar Setting" />
    </label>
    <button @click="save">Save</button>
  </div>
</template>
