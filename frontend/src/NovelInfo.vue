<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authFetch } from './auth.js';

const novel = ref(null);
const route = useRoute();

async function fetchNovel() {
  const ncode = route.params.ncode;
  const res = await authFetch(`/api/novels/${ncode}`);
  novel.value = await res.json();
}

onMounted(fetchNovel);
</script>

<template>
  <div v-if="novel">
    <h2>{{ novel.title }}</h2>
    <p v-for="(value, key) in novel" :key="key">
      <strong>{{ key }}:</strong> {{ value }}
    </p>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>
