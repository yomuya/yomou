<script setup>
import { ref, onMounted } from 'vue';
import { authFetch } from './auth.js';
import Table from './components/Table.vue';

const users = ref([]);
const trackedNovels = ref([]);
const novels = ref([]);

async function loadFollows() {
  try {
    const res = await authFetch('/api/novels/follow');
    if (res.status === 401 || res.status === 403) {
      trackedNovels.value = [];
    } else {
      trackedNovels.value = await res.json();
    }
  } catch (e) {
    trackedNovels.value = [];
    console.error('Failed to load follows', e);
  }
}
async function loadNovels() {
  try {
    const res = await authFetch('/api/novels');
    if (res.status === 401 || res.status === 403) {
      novels.value = [];
    } else {
      novels.value = await res.json();
    }
  } catch (e) {
    novels.value = [];
    console.error('Failed to load novels', e);
  }
}
onMounted(loadFollows)
onMounted(loadNovels)
</script>

<template>
  <div class="container">
    <h1>Dashboard</h1>
    <h2>Tracked Novels</h2>
    <Table
      v-if="trackedNovels.length > 0"
      :items="trackedNovels"
      :columns="[
        { key: 'ncode', label: 'Novel Code' },
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'current_chapter', label: 'Current Chapter' },
        { key: 'total_chapters', label: 'Total Chapters' }
      ]"
      rowKey="ncode"
    />
    <h2>All Novels</h2>
    <Table
      v-if="novels.length > 0"
      :items="novels"
      :columns="Object.keys(novels[0] || {})"
      rowKey="ncode"
    />
    </div>
</template>

