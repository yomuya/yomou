<script setup>
import { ref } from 'vue';

const showMenu = ref(false);

function goTo(path) {
  window.location.href = path;
}

function logout() {
  localStorage.removeItem('token');
  alert('Logged out!');
  window.location.href = '/login';
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
  emit('toggle', showMenu.value);
}

const emit = defineEmits(['toggle']);
</script>

<template>
  <div :class="['hamburger-menu', { 'menu-open': showMenu }]">
    <button class="hamburger" @click="toggleMenu" aria-label="Toggle menu">
      &#9776;
    </button>
    <div class="nav-buttons" v-if="showMenu">
      <div class="nav-buttons-inner">
        <button @click="goTo('/')">Dashboard</button>
        <button @click="goTo('/lookup')">Novel Lookup</button>
        <button @click="goTo('/reader')">Reader</button>
        <button @click="logout">Logout</button>
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
@use '../styles/hamburger.scss';
</style>
