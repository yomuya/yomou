<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authFetch } from './auth.js';

const scrapeAheadCount = ref(1);
const scraping = ref(false);
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

async function scrapeAhead() {
  if (!novel.value) return;
  try {
    await authFetch('/api/syosetu/scrapeahead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ncode: novel.value.ncode, count: scrapeAheadCount.value })
    });
  } catch (e) {
    // ignore errors for individual chapters
  }
  await fetchNovel();
  scraping.value = false;
}

function setReaderChapter(chapter) {
  if (novel.value && novel.value.ncode) {
    localStorage.setItem(`${novel.value.ncode}_chapter`, chapter);
  }
}

async function updateChapter(novelObj, event) {
  const ncode = novelObj.ncode;
  const chapter = novelObj.current_chapter;
  await authFetch('/api/novels/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ncode, chapter }),
  });
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
          <p><strong>Progress: </strong>
            <input
              v-if="novel"
              v-model.number="novel.current_chapter"
              type="number"
              min="1"
              :max="novel.total_chapters"
              style="width: 4em; margin-right: 0.5em;"
              @change="updateChapter(novel, $event)"
            />
            / {{ novel.total_chapters }}
          </p>
          <p><strong>Last Checked:</strong> {{ novel.last_checked }}</p>
        </div>
        <div v-else>
          <p>Loading...</p>
        </div>
        <div v-if="novel" style="margin-top: 1em;">
          <label>
            Scrape ahead:
            <input v-model.number="scrapeAheadCount" type="number" min="1" style="width: 4em; margin-right: 0.5em;" />
          </label>
          <button @click="scrapeAhead" :disabled="scraping">{{ scraping ? 'Scraping...' : 'Scrape ahead' }}</button>
        </div>
      </div>
    </div>
    <div class="toc-box" v-if="toc.length">
      <h3>Scraped Table of Contents</h3>
      <ul>
        <li v-for="ch in toc" :key="ch.chapter">
          <router-link :to="`/reader/${novel.ncode}`" @click.native="setReaderChapter(ch.chapter)">
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
