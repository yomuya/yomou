<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authFetch } from './auth.js';
import { scrape } from './scripts/scrape.js';
import { setNcodeChapter, initializeChapter as initializeChapterCache, setNcodeTotalChapters, initializeTotalChapters as initializeTotalChaptersCache } from './scripts/cache.js'
import { fetchChapter as fetchChapterDb, updateCurrentChapter } from './scripts/database.js';

const scrapeAheadCount = ref(1);
const route = useRoute()
const ncode = ref(route.params.ncode ?? '')
const chapterNum = ref(null)
const chapter = ref(null)
const totalChapters = ref(null)

async function fetchChapter() {
  const result = await fetchChapterDb(ncode.value, chapterNum.value, scrapeAheadCount.value)
  chapter.value = result
  if (result && (chapterNum.value < 1 || chapterNum.value > totalChapters.value)) {
    totalChapters.value = result.total_chapters || totalChapters.value
    await updateCurrentChapter(ncode.value, chapterNum.value)
    await scrape(ncode.value, chapterNum.value + scrapeAheadCount.value);
  }
}

async function initializeChapter() {
  chapterNum.value = await initializeChapterCache(ncode.value, chapterNum.value);
  totalChapters.value = await initializeTotalChaptersCache(ncode.value);
  fetchChapter();
}

onMounted(initializeChapter)
</script>

<template>
  <div class="controls">
    <label>
      <button
        :disabled="chapterNum <= 1"
        @click="chapterNum > 1 ? (chapterNum--, setNcodeChapter(ncode, chapterNum), fetchChapter()) : null"
      >Previous</button>
      <input v-model.number="chapterNum" type="number" min="1" :max="totalChapters" @change="setNcodeChapter(ncode, chapterNum); fetchChapter()" />
      <button
        :disabled="chapterNum >= totalChapters"
        @click="chapterNum < totalChapters ? (chapterNum++, setNcodeChapter(ncode, chapterNum), fetchChapter()) : null"
      >Next</button>
    </label>
  </div>

  <div class="content" v-if="chapter">
    <h1>{{ chapter.title }}</h1>
    <section v-if="chapter.preface" class="section">
      <p v-for="(line, idx) in chapter.preface.split('\n')" :key="idx">{{ line }}</p>
    </section>
    <section v-if="chapter.body" class="section">
      <p v-for="(line, idx) in chapter.body.split('\n')" :key="idx">{{ line }}</p>
    </section>
    <section v-if="chapter.afterword" class="section">
      <p v-for="(line, idx) in chapter.afterword.split('\n')" :key="idx">{{ line }}</p>
    </section>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>

  <div class="controls">
    <label>
      <button
        :disabled="chapterNum <= 1"
        @click="chapterNum > 1 ? (chapterNum--, setNcodeChapter(ncode, chapterNum), fetchChapter()) : null"
      >Previous</button>
      <input v-model.number="chapterNum" type="number" min="1" :max="totalChapters" @change="setNcodeChapter(ncode, chapterNum); fetchChapter()" />
      <button
        :disabled="chapterNum >= totalChapters"
        @click="chapterNum < totalChapters ? (chapterNum++, setNcodeChapter(ncode, chapterNum), fetchChapter()) : null"
      >Next</button>
    </label>
  </div>
</template>

<style scoped lang="scss">
@use './styles/reader.scss';
</style>
