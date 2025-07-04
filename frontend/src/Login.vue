<script setup>
import { ref, computed, watch } from 'vue';

const showDialog = ref(false);
const dialog = ref(null);
const newUser = ref({ name: '', password: '', email: '' });
const loginUser = ref({ user: '', password: '' });

const isLoggedIn = computed(() => !!localStorage.getItem('token'));

watch(showDialog, (val) => {
  if (val) dialog.value.showModal();
  else dialog.value.close();
});

function goToDashboard() {
  window.location.href = '/';
}

function addUser() {
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: newUser.value.name,
      pass: newUser.value.password,
      email: newUser.value.email
    })
  })
  .then(res => res.json())
  .then(() => {
    newUser.value = { name: '', password: '', email: '' };
    showDialog.value = false;
  });
}

function login() {
  fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: loginUser.value.user,
      password: loginUser.value.password
    })
  })
  .then(res => res.json())
  .then(response => {
    if (response.error) {
      alert('Login failed: ' + response.error);
    } else {
      localStorage.setItem('token', response.token);
      alert('Welcome, ' + response.user.name + '!');
      window.location.href = '/';
    }
  });
}

function logout() {
  localStorage.removeItem('token');
  alert('Logged out!');
}
</script>

<template>
  <div class="container">
    <dialog ref="dialog">
      <form @submit.prevent="addUser">
        <input v-model="newUser.name" placeholder="Name" required>
        <input v-model="newUser.password" placeholder="Password" type="password" required>
        <input v-model="newUser.email" placeholder="Email" required>
        <div style="display: flex; gap: 1rem;">
          <button type="submit">Add</button>
          <button type="button" @click="showDialog = false">Cancel</button>
        </div>
      </form>
    </dialog>

    <div class="card">
      <h1>Login</h1>
      <form @submit.prevent="login">
        <input v-model="loginUser.user" placeholder="Username/Email" required>
        <input v-model="loginUser.password" placeholder="Password" type="password" required>
        <button type="submit">Login</button>
      </form>
      <button @click="showDialog = true" style="margin-top:1rem;">Create User</button>
    </div>
  </div>
</template>


<style scoped lang="scss">
@use 'styles/login.scss';
</style>
