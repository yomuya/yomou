<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchNovel, fetchNovelToC, updateCurrentChapter } from './scripts/database.js'
import { scrapeAhead } from './scripts/scrape.js';
import { setNcodeChapter } from './scripts/cache.js'

const scrapeRangeStart = ref(1);
const scrapeRangeEnd = ref(1);
const scraping = ref(false);
const novel = ref(null);
const toc = ref([]);
const route = useRoute();

onMounted(async () => {
  novel.value = await fetchNovel(route.params.ncode);
  toc.value = await fetchNovelToC(route.params.ncode);
});


async function handleScrapeAhead() {
  if (!novel.value) return;
  scraping.value = true;
  try {
    const updatedNovel = await scrapeAhead({
      ncode: novel.value.ncode,
      start: scrapeRangeStart.value,
      end: scrapeRangeEnd.value
    });
    novel.value = updatedNovel;
  } catch (e) {
    // ignore errors for individual chapters
  }
  scraping.value = false;
}

watch(novel, (val) => {
  if (val) {
    scrapeRangeStart.value = val.current_chapter || 1;
    scrapeRangeEnd.value = val.total_chapters || 1;
  }
});
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
              @change="updateCurrentChapter(novel.ncode, novel.current_chapter)"
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
            Scrape range:
            <input v-model.number="scrapeRangeStart" type="number" min="1" :max="novel ? novel.total_chapters : 1" style="width: 4em; margin-right: 0.5em;" />
            -
            <input v-model.number="scrapeRangeEnd" type="number" min="1" :max="novel ? novel.total_chapters : 1" style="width: 4em; margin-right: 0.5em;" />
          </label>
          <button @click="handleScrapeAhead" :disabled="scraping">{{ scraping ? 'Scraping...' : 'Scrape range' }}</button>
        </div>
      </div>
    </div>
    <div class="toc-box" v-if="toc.length">
      <h3>Scraped Table of Contents</h3>
      <ul>
        <li v-for="ch in toc" :key="ch.chapter">
          <router-link :to="`/reader/${novel.ncode}`" @click.native="setNcodeChapter(novel.ncode, ch.chapter)">
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
