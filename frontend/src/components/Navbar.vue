<script setup>
import { ref } from 'vue';

const props = defineProps({
  showMenu: { type: Boolean, default: true }
});

function goTo(path) {
  window.location.href = path;
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

const emit = defineEmits(['toggle']);
function toggleMenu() {
  emit('toggle', false);
}

</script>

<template>
  <div>
    <button
      class="hide-menu-btn"
      @click="emit('toggle', !showMenu)"
      aria-label="Toggle Menu"
    >
      <svg v-if="showMenu" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M6 15l6-6 6 6" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div
      class="navbar"
      :style="{ display: showMenu ? 'flex' : 'none' }"
    >
      <div class="nav-buttons">
        <div class="nav-buttons-inner">
          <button @click="goTo('/')">Dashboard</button>
          <button @click="goTo('/lookup')">Novel Lookup</button>
          <button @click="goTo('/settings')">Settings</button>
          <button @click="logout">Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/navbar.scss';
</style>
