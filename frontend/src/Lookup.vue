<script setup>
import { ref } from 'vue';
import { authFetch } from './auth.js';
import Table from './components/Table.vue';
import { followNovel } from './scripts/database.js';

const ncode = ref('n4185ci');
const output = ref('Loading...');
const outputTable = ref(null);
const showTrackBtn = ref(false);
const trackMsg = ref('');
const isAuthenticated = ref(false);

async function fetchNovel() {
  try {
    if (!ncode.value || typeof ncode.value !== 'string' || !ncode.value.trim()) {
      output.value = 'Error: No ncode provided.';
      outputTable.value = null;
      return;
    }
    console.log("Fetching ncode:", ncode.value);
    const res = await authFetch(`/api/syosetu?ncode=${encodeURIComponent(ncode.value)}`);
    if (!res.ok) {
      let errMsg;
      if (import.meta.env.VITE_STATIC === 'true') {
        errMsg = 'Unable to connect to the backend server. This feature is unavailable in static/demo mode. Please follow the steps for running the full tool at the GitHub page.';
      } else {
        errMsg = 'Failed to fetch novel data from API.';
      }
      throw new Error(errMsg);
    }
    const full_data = await res.json();
    const data = full_data[1];
    output.value = JSON.stringify(data, null, 2);

    if (Array.isArray(data) && data.length === 1 && typeof data[0] === 'object') {
      outputTable.value = data[0];
      showTrackBtn.value = true;
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      outputTable.value = data;
      showTrackBtn.value = true;
    } else {
      outputTable.value = null;
    }
  } catch (err) {
    output.value = 'Error: ' + (err.message || String(err));
    outputTable.value = null;
  }
}

async function trackNovel() {
  try {
    const text = await followNovel(ncode.value);
    trackMsg.value += text;
  } catch (err) {
    trackMsg.value += 'Error: ' + err;
  }
}

outputTable.value = null;
fetchNovel();
</script>

<template>
  <div>
    <h1>Novel Lookup</h1>
    <input type="text" v-model="ncode" placeholder="Enter ncode (e.g. n4185ci)">
    <button @click="fetchNovel">Lookup Ncode</button>
    <button v-show="showTrackBtn" @click="trackNovel">Track Novel</button>
    <p v-show="trackMsg" v-html="trackMsg"></p>
    <Table
      v-if="outputTable"
      :items="Object.entries(outputTable).map(([key, value]) => ({ key, value }))"
      :columns="[
        { key: 'key', label: 'Field' },
        { key: 'value', label: 'Value' }
      ]"
      rowKey="key"
      :show-headers="false"
    >
      <template #cell-value="{ item }">
        <span v-if="typeof item.value === 'object' && item.value !== null">
          <pre>{{ JSON.stringify(item.value, null, 2) }}</pre>
        </span>
        <span v-else>{{ item.value }}</span>
      </template>
    </Table>
    <pre v-else>{{ output }}</pre>
  </div>
</template>
