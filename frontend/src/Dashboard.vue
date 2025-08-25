<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Table from './components/Table.vue';
const router = useRouter();
import { loadFollows } from './scripts/database.js';
import { setNovelProgress } from './scripts/cache.js';
import { setUserSettings } from './scripts/settings.js';
import { importFile } from './scripts/importer.js';

const trackedNovels = ref([]);
const isMobile = ref(window.innerWidth <= 1000);
function handleResize() {
  isMobile.value = window.innerWidth <= 1000;
}
onMounted(() => window.addEventListener('resize', handleResize));
onUnmounted(() => window.removeEventListener('resize', handleResize));

onMounted(async () => {
  const result = await loadFollows();
  trackedNovels.value = result.value;
});

function goToNovel(novel) {
  router.push({ path: `/novel/${novel.ncode}` });
}

function goToReader(novel) {
  setNovelProgress(novel.ncode, novel.current_chapter, novel.total_chapters);
  router.push({ path: `/reader/${novel.ncode}` });
}

const importApiValues = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        await importFile(evt.target.result, true); // true = from browser
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

</script>

<template>
  <div class="container" style="position:relative;">
    <button class="import-btn" @click="importApiValues">Import Novel JSON</button>
    <h1>Dashboard</h1>
    <h2>Tracked Novels</h2>
    <Table
      v-if="trackedNovels.length > 0"
      :items="trackedNovels"
      :columns="isMobile
        ? [
            { key: 'title', label: 'Title' },
            { key: 'progress', label: 'Progress' }
          ]
        : [
            { key: 'ncode', label: 'Novel Code' },
            { key: 'title', label: 'Title' },
            { key: 'author', label: 'Author' },
            { key: 'progress', label: 'Progress' }
          ]"
      rowKey="ncode"
      @row-click="goToNovel"
    >
      <template #cell-progress="{ item }">
        <span class="nav-reader" @click.stop="goToReader(item)">
          {{ item.current_chapter }}
        </span>
        /
        <span class="nav-reader"  @click.stop="goToReader(item)">
          {{ item.total_chapters }}
        </span>
      </template>
    </Table>
    <div v-else>
      No tracked novels
    </div>
  </div>
</template>

<style scoped>
.nav-reader {
  color: #5fd3fa;
  cursor: pointer;
  transition: color 0.18s, background 0.18s;
  border-radius: 3px;
  padding: 0 2px;
}
.nav-reader:hover {
  color: #fff;
  background: #3a3a5e;
}
.import-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: #5fd3fa;
  color: #222;
  border: none;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.import-btn:hover {
  background: #3a3a5e;
  color: #fff;
}
</style>

