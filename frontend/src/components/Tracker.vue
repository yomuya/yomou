<template>
  <div id="trackerContent">
    <h1>Tracker</h1>
    <button @click="goToDashboard">Go to Dashboard</button>
    <h2>Tracked Novels</h2>
    <ul id="trackedNovelList">
      <li v-if="novels.length === 0">No tracked novels</li>
      <li v-for="n in novels" :key="n.ncode">
        Ncode:{{ n.ncode }}, Title: {{ n.title }}
        <span> Chapter: </span>
        <input
          type="number"
          min="1"
          :value="n.current_chapter || 1"
          :id="`current-chapter-${n.ncode}`"
          @change="updateChapter(n, $event)"
        />
        <span> / {{ n.total_chapters }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import {authFetch } from '../auth.js';

export default {
  name: 'Tracker',
  data() {
    return {
      novels: [],
    };
  },
  methods: {
    goToDashboard() {
      window.location.href = '/';
    },
    async loadFollows() {
      try {
        const res = await authFetch('/api/novels/follow', { method: 'GET' });
        if (res.status === 401 || res.status === 403) {
          this.novels = [];
        } else {
          this.novels = await res.json();
        }
      } catch {
        this.novels = [];
      }
    },
    async updateChapter(novel, event) {
      const ncode = novel.ncode;
      const chapter = parseInt(event.target.value, 10) || novel.current_chapter;
      await authFetch('/api/novels/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ncode, chapter }),
      });
    },
  },
  mounted() {
    this.loadFollows();
  },
};
</script>
