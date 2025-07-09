<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authFetch } from './auth.js';

const novel = ref(null);
const toc = ref([]);
const route = useRoute();

async function fetchNovel() {
  const ncode = route.params.ncode;
  const res = await authFetch(`/api/novels/${ncode}`);
  novel.value = await res.json();
  const tocRes = await authFetch(`/api/novels/${ncode}/toc`);
  toc.value = await tocRes.json();
}

onMounted(fetchNovel);
</script>

<template>
  <div class="novel-info-container">
    <div class="novel-info-row">
      <div class="novel-image-box"></div>
      <div class="novel-info-box">
        <div v-if="novel">
          <h2>{{ novel.title }}</h2>
          <p><strong>Ncode:</strong> {{ novel.ncode }}</p>
          <p><strong>Author:</strong> {{ novel.author }}</p>
          <p><strong>Progress:</strong> {{novel.current_chapter}}/{{ novel.total_chapters }}</p>
          <p><strong>Last Checked:</strong> {{ novel.last_checked }}</p>
        </div>
        <div v-else>
          <p>Loading...</p>
        </div>
      </div>
    </div>
    <div class="toc-box" v-if="toc.length">
      <h3>Scraped Table of Contents</h3>
      <ul>
        <li v-for="ch in toc" :key="ch.chapter">
          <router-link :to="`/reader/${novel.ncode}/${ch.chapter}`">
            {{ ch.title || 'Untitled' }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/novelinfo.scss';
</style>
