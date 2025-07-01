<template>
  <div>
    <h1>Add User</h1>
    <button @click="showDialog = true">Create User</button>
    <button @click="goToDashboard">Go to Dashboard</button>

    <dialog ref="dialog">
      <form @submit.prevent="addUser">
        <input v-model="newUser.name" placeholder="Name" required>
        <input v-model="newUser.password" placeholder="Password" type="password" required>
        <input v-model="newUser.email" placeholder="Email" required>
        <button type="submit">Add</button>
      </form>
    </dialog>

    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="loginUser.user" placeholder="Username/Email" required>
      <input v-model="loginUser.password" placeholder="Password" type="password" required>
      <button type="submit">Login</button>
    </form>
    <button v-if="isLoggedIn" @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDialog: false,
      newUser: { name: '', password: '', email: '' },
      loginUser: { user: '', password: '' }
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  },
  watch: {
    showDialog(val) {
      if (val) this.$refs.dialog.showModal();
      else this.$refs.dialog.close();
    }
  },
  methods: {
    goToDashboard() {
      window.location.href = '/';
    },
    addUser() {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.newUser.name,
          pass: this.newUser.password,
          email: this.newUser.email
        })
      })
      .then(res => res.json())
      .then(() => {
        this.newUser = { name: '', password: '', email: '' };
        this.showDialog = false;
      });
    },
    login() {
      fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: this.loginUser.user,
          password: this.loginUser.password
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
    },
    logout() {
      localStorage.removeItem('token');
      alert('Logged out!');
    }
  }
};
</script>
