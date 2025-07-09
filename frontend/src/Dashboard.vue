<script setup>
import { ref, onMounted } from 'vue';
import { authFetch } from './auth.js';
import Table from './components/Table.vue';

const users = ref([]);
const trackedNovels = ref([]);

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
async function updateChapter(novel, event) {
  const ncode = novel.ncode;
  const chapter = parseInt(event.target.value, 10) || novel.current_chapter;
  await authFetch('/api/novels/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode, chapter }),
  });
}

onMounted(loadFollows)
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
    >
      <template #cell-current_chapter="{ item }">
        <input
          v-model="item.current_chapter"
          type="number"
          class="table-input"
          @change="updateChapter(item, $event)"
        />
      </template>
    </Table>
    <div v-else>
      No tracked novels
    </div>
  </div>
</template>

