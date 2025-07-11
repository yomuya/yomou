<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Table from './components/Table.vue';
const router = useRouter();
import { loadFollows } from './scripts/database.js'

const trackedNovels = ref([]);

onMounted(async () => {
  const result = await loadFollows();
  trackedNovels.value = result.value;
});

function goToNovel(novel) {
  router.push({ path: `/novel/${novel.ncode}` });
}


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
      @row-click="goToNovel"
    >
    </Table>
    <div v-else>
      No tracked novels
    </div>
  </div>
</template>

