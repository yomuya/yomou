<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchNovel, fetchNovelToC, updateCurrentChapter } from './scripts/database.js'
import { scrapeAhead } from './scripts/scrape.js';
import { setNovelProgress, setNovel, removeChaptersFromIndexedDB } from './scripts/cache.js'


const scrapeRangeStart = ref(1);
const scrapeRangeEnd = ref(1);
const scrapeRangeAhead = ref(1);
const scraping = ref(false);
const novel = ref(null);
const toc = ref([]);
const tocDisplayCount = ref(20);
const tocDisplayStart = ref(0);
const route = useRoute();
const selectedChapters = ref([]);
const showCheckboxes = ref(false);

onMounted(async () => {
  novel.value = await fetchNovel(route.params.ncode);
  toc.value = await fetchNovelToC(route.params.ncode);
  setNovel(novel.value)
});


async function handleScrapeAhead(start, end) {
  if (!novel.value) return;
  scraping.value = true;
  try {
    const updatedNovel = await scrapeAhead({
      ncode: novel.value.ncode,
      start: start,
      end: end 
    });
    if (updatedNovel && updatedNovel.ncode && updatedNovel.title) {
      novel.value = updatedNovel;
      toc.value = await fetchNovelToC(novel.value.ncode);
    } else {
    }
  } catch (e) {
    // ignore errors for individual chapters
  }
  scraping.value = false;
}

function goToSyosetu(novel) {
  window.open(`https://ncode.syosetu.com/${novel.ncode}`, '_blank');
}

function removeChapterFromCache(chapterNum) {
  if (!novel.value) return;
  removeChaptersFromIndexedDB(novel.value.ncode, [chapterNum]);
}
function removeSelectedChapters() {
  if (!novel.value || selectedChapters.value.length === 0) return;
  removeChaptersFromIndexedDB(novel.value.ncode, selectedChapters.value.slice());
  selectedChapters.value = [];
}

watch(novel, (val) => {
  if (val) {
    scrapeRangeStart.value = val.current_chapter || 1;
    scrapeRangeEnd.value = val.total_chapters || 1;
  }
});
watch(tocDisplayCount, () => {
  tocDisplayStart.value = 0;
});
watch(toc, () => {
  tocDisplayStart.value = 0;
});
</script>

<template>
  <div class="novel-info-row novel-info-column">
    <div class="novel-info-box">
      <div v-if="novel">
        <h2>
          <span style="cursor:pointer; color:lightblue;" @click.stop="goToSyosetu(novel)">
            {{ novel.title }}
          </span>
        </h2>
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
            @change="updateCurrentChapter(novel.ncode, Number(novel.current_chapter), novel.total_chapters)"
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
          Scrape Ahead:
          <input v-model.number="scrapeRangeAhead" type="number" min="1" :max="novel ? novel.total_chapters : 1" style="width: 4em; margin-right: 0.5em;" />
        </label>
        <button @click="handleScrapeAhead(scrapeRangeStart, scrapeRangeStart + scrapeRangeAhead)" :disabled="scraping">{{ scraping ? 'Scraping...' : 'Scrape range' }}</button>
      </div>

      <div v-if="novel" style="margin-top: 1em;">
        <label>
          Scrape range:
          <input v-model.number="scrapeRangeStart" type="number" min="1" :max="novel ? novel.total_chapters : 1" style="width: 4em; margin-right: 0.5em;" />
          -
          <input v-model.number="scrapeRangeEnd" type="number" min="1" :max="novel ? novel.total_chapters : 1" style="width: 4em; margin-right: 0.5em;" />
        </label>
        <button @click="handleScrapeAhead(scrapeRangeStart, scrapeRangeEnd)" :disabled="scraping">{{ scraping ? 'Scraping...' : 'Scrape range' }}</button>
      </div>
    </div>
    <div class="toc-box" v-if="toc.length">
      <div style="display: flex; align-items: center; margin-bottom: 0.5em;">
        <span
          @click="removeSelectedChapters"
          :style="{
            marginRight: '0.7em',
            cursor: selectedChapters.length === 0 ? 'not-allowed' : 'pointer',
            opacity: selectedChapters.length === 0 ? 0.5 : 1,
            fontSize: '1.2em'
          }"
          title="Remove selected chapters"
          :disabled="selectedChapters.length === 0"
        >🗑️</span>
      </div>
      <h3>Scraped Table of Contents</h3>
      <label style="display:inline-block; margin-bottom:0.7em;">
        Show
        <select v-model.number="tocDisplayCount" style="margin: 0 0.5em;">
          <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">{{ n }}</option>
        </select>
        chapters
      </label>
      <ul>
        <li v-if="toc.length > tocDisplayCount" class="toc-nav-row toc-nav-row--top">
          <p
            class="toc-nav-btn"
            :class="{ disabled: tocDisplayStart === 0 }"
            @click="tocDisplayStart === 0 ? null : (tocDisplayStart = Math.max(0, tocDisplayStart - tocDisplayCount))"
          >
            &#8592; Previous {{ tocDisplayCount }}
          </p>
          <p
            class="toc-nav-btn"
            :class="{ disabled: tocDisplayStart + tocDisplayCount >= toc.length }"
            @click="tocDisplayStart + tocDisplayCount >= toc.length ? null : (tocDisplayStart = Math.min(toc.length - tocDisplayCount, tocDisplayStart + tocDisplayCount))"
          >
            Next {{ tocDisplayCount }} &#8594;
          </p>
        </li>
        <li
          v-for="ch in toc.slice(tocDisplayStart, tocDisplayStart + tocDisplayCount)"
          :key="ch.chapter"
          style="display: flex; align-items: center;"
        >
          <input
            type="checkbox"
            :value="ch.chapterNum"
            v-model="selectedChapters"
            style="margin-right: 0.5em;"
          />
          <router-link
            :to="`/reader/${novel.ncode}`"
            @click.prevent="setNovelProgress(novel.ncode, Number(ch.chapterNum), novel.total_chapters)"
          >
            {{ ch.title || 'Untitled' }}
          </router-link>
        </li>
        <li v-if="toc.length > tocDisplayCount" class="toc-nav-row toc-nav-row--bottom">
          <p
            class="toc-nav-btn"
            :class="{ disabled: tocDisplayStart === 0 }"
            @click="tocDisplayStart === 0 ? null : (tocDisplayStart = Math.max(0, tocDisplayStart - tocDisplayCount))"
          >
            &#8592; Previous {{ tocDisplayCount }}
          </p>
          <p
            class="toc-nav-btn"
            :class="{ disabled: tocDisplayStart + tocDisplayCount >= toc.length }"
            @click="tocDisplayStart + tocDisplayCount >= toc.length ? null : (tocDisplayStart = Math.min(toc.length - tocDisplayCount, tocDisplayStart + tocDisplayCount))"
          >
            Next {{ tocDisplayCount }} &#8594;
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/novelinfo.scss';
</style>
