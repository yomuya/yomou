<script setup>
import { ref } from 'vue';

const showMenu = ref(true);

function goTo(path) {
  window.location.href = path;
}

function logout() {
  localStorage.removeItem('token');
  alert('Logged out!');
  window.location.href = '/login';
}

const emit = defineEmits(['toggle']);

function toggleMenu() {
  showMenu.value = !showMenu.value;
  emit('toggle', showMenu.value);
}
</script>

<template>
  <div class="navbar">
    <div class="nav-buttons">
      <div class="nav-buttons-inner">
        <button @click="goTo('/')">Dashboard</button>
        <button @click="goTo('/lookup')">Novel Lookup</button>
        <button @click="logout">Logout</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/navbar.scss';
</style>
