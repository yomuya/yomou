<script setup>
import { ref, onMounted } from 'vue'
import { authFetch } from './auth.js';

const chapter = ref(null)
const ncode = ref('n4185ci')
const chapterNum = ref(5)
async function fetchChapter() {
  try {
    const res = await authFetch(`/api/syosetu/chapter?ncode=${ncode.value}&chapter=${chapterNum.value}`)
    if (res.ok) {
      const text = await res.text()
      chapter.value = JSON.parse(text)
    } else if (res.status === 404) {
      // Try scraping if not found
      const scrapeRes = await authFetch(`/api/syosetu/scrape?ncode=${ncode.value}&chapter=${chapterNum.value}`)
      if (scrapeRes.ok) {
        // After scraping, try fetching again
        const retryRes = await authFetch(`/api/syosetu/chapter?ncode=${ncode.value}&chapter=${chapterNum.value}`)
        if (retryRes.ok) {
          const retryText = await retryRes.text()
          chapter.value = JSON.parse(retryText)
        } else {
          chapter.value = null
        }
      } else {
        chapter.value = null
      }
    } else {
      chapter.value = null
    }
  } catch (e) {
    console.error('Network error:', e)
  }
}
onMounted(fetchChapter)
</script>

<template>
  <div style="margin-bottom: 1em;">
    <label>
      Ncode:
      <input v-model="ncode" type="text" style="margin-right: 1em;" />
    </label>
    <label>
      Chapter:
      <input v-model.number="chapterNum" type="number" min="1" style="margin-right: 1em; width: 4em;" />
    </label>
    <button @click="fetchChapter">Load Chapter</button>
  </div>

  <div class="content" v-if="chapter">
    <h1 style="margin-bottom: 1em;">{{ chapter.title }}</h1>
    <section v-if="chapter.preface" style="text-align: left; border-bottom: 1px solid #ccc; margin-bottom: 1em; padding-bottom: 1em;">
      <p v-for="(line, idx) in chapter.preface.split('\n')" :key="idx">{{ line }}</p>
    </section>
    <section v-if="chapter.body" style="text-align: left; border-bottom: 1px solid #ccc; margin-bottom: 1em; padding-bottom: 1em;">
      <p v-for="(line, idx) in chapter.body.split('\n')" :key="idx">{{ line }}</p>
    </section>
    <section v-if="chapter.afterword" style="text-align: left; border-bottom: 1px solid #ccc; margin-bottom: 1em; padding-bottom: 1em;">
      <p v-for="(line, idx) in chapter.afterword.split('\n')" :key="idx">{{ line }}</p>
    </section>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<style scoped>
.content {
  max-width: 60vw;
  margin: 0 auto;
  word-break: break-word;
  overflow-wrap: anywhere;
}
</style>

