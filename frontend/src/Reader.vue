<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authFetch } from './auth.js';
import { scrape } from './scripts/scrape.js';
import { setNcodeChapter, initializeChapter as initializeChapterCache } from './scripts/cache.js'
import { fetchChapter as fetchChapterDb, updateCurrentChapter } from './scripts/database.js';

const scrapeAheadCount = ref(1);
const route = useRoute()
const ncode = ref(route.params.ncode ?? '')
const chapterNum = ref(null)
const chapter = ref(null)

async function fetchChapter() {
  const result = await fetchChapterDb(ncode.value, chapterNum.value, scrapeAheadCount.value)
  chapter.value = result
  if (result) {
    await updateCurrentChapter(ncode.value, chapterNum.value)
    await scrape(ncode.value, chapterNum.value + scrapeAheadCount.value);
  }
}

async function initializeChapter() {
  chapterNum.value = await initializeChapterCache(ncode.value, chapterNum.value);
  fetchChapter();
}

onMounted(initializeChapter)
</script>

<template>
  <div class="controls">
    <label>
        <button @click="chapterNum > 1 && (chapterNum--, setNcodeChapter(ncode, chapterNum), fetchChapter())">Previous</button>
        <input v-model.number="chapterNum" type="number" min="1" @change="setNcodeChapter(ncode, chapterNum); fetchChapter()" />
        <button @click="chapterNum++, setNcodeChapter(ncode, chapterNum), fetchChapter()">Next</button>
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
        <button @click="chapterNum > 1 && (chapterNum--, setNcodeChapter(ncode, chapterNum), fetchChapter())">Previous</button>
        <input v-model.number="chapterNum" type="number" min="1" @change="setNcodeChapter(ncode, chapterNum); fetchChapter()" />
        <button @click="chapterNum++, setNcodeChapter(ncode, chapterNum), fetchChapter()">Next</button>
    </label>
  </div>
</template>

<style scoped lang="scss">
@use './styles/reader.scss';
</style>
