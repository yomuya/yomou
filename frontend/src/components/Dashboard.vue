<template>
  <div>
    <h1>Dashboard</h1>
    <button @click="logout">Logout</button>
    <button @click="goTo('/login')">Go to Login</button>
    <button @click="goTo('/lookup')">Go to Novel Lookup</button>
    <button @click="goTo('/tracker')">Go to Tracker</button>
    <h2>Users</h2>
    <ul>
      <li v-for="u in users" :key="u.email">{{ u.name }} ({{ u.email }})</li>
      <li v-if="users.length === 0">Login to see users</li>
    </ul>
    <h2>Tracked Novels</h2>
    <ul>
      <li v-for="n in trackedNovels" :key="n.ncode">
        Ncode:{{ n.ncode }}, Title: {{ n.title }}, Author: {{ n.author }}, Current Chapters: {{ n.current_chapter }}, Total Chapters: {{ n.total_chapters }}, Last Checked: {{ n.last_checked }}, User ID: {{ n.user_id }}, Followed At: {{ n.followed_at }}
      </li>
      <li v-if="trackedNovels.length === 0">No tracked novels</li>
    </ul>
    <h2>All Novels</h2>
    <ul>
      <li v-for="n in novels" :key="n.ncode">
        Ncode:{{ n.ncode }}, Title: {{ n.title }}, Author: {{ n.author }}, Total Chapters: {{ n.total_chapters }}, Last Checked: {{ n.last_checked }}
      </li>
      <li v-if="novels.length === 0">No novels in database</li>
    </ul>
  </div>
</template>

<script>
import { authFetch } from '../auth.js';

export default {
  data() {
    return {
      users: [],
      trackedNovels: [],
      novels: [],
      authChecked: false
    };
  },
  methods: {
    goTo(path) {
      window.location.href = path;
    },
    logout() {
      localStorage.removeItem('token');
      alert('Logged out!');
      window.location.href = '/login';
    },
    async loadUsers() {
      try {
        const res = await authFetch('/api/users');
        if (res.status === 401 || res.status === 403) {
          this.users = [];
        } else {
          this.users = await res.json();
        }
      } catch (e) {
        this.users = [];
        console.error('Failed to load users', e);
      }
    },
    async loadFollows() {
      try {
        const res = await authFetch('/api/novels/follow');
        if (res.status === 401 || res.status === 403) {
          this.trackedNovels = [];
        } else {
          this.trackedNovels = await res.json();
        }
      } catch (e) {
        this.trackedNovels = [];
        console.error('Failed to load follows', e);
      }
    },
    async loadNovels() {
      try {
        const res = await authFetch('/api/novels');
        if (res.status === 401 || res.status === 403) {
          this.novels = [];
        } else {
          this.novels = await res.json();
        }
      } catch (e) {
        this.novels = [];
        console.error('Failed to load novels', e);
      }
    }
  },
  async mounted() {
    this.authChecked = true;
    await this.loadUsers();
    await this.loadFollows();
    await this.loadNovels();
  },
};
</script>
