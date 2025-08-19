<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'

const menuOpen = ref(true)
const isMobile = ref(window.innerWidth <= 1000)

function handleResize() {
  isMobile.value = window.innerWidth <= 1000
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  const themeName = localStorage.getItem('globalTheme') || 'dark';
  await import('./scripts/settings.js').then(mod => mod.applyTheme(themeName));
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleToggle(val) {
  menuOpen.value = val
}
</script>

<template>
  <div>
    <Navbar :show-menu="menuOpen" @toggle="handleToggle" />
    <div class="container" :style="{ paddingTop: menuOpen && !isMobile ? '4rem' : '0', 
                                     paddingBottom: menuOpen && isMobile ? '4rem' : '0', 
                                     paddingTop: isMobile ? '1rem' : '0'}">
      <RouterView/>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
