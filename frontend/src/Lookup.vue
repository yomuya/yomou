<script setup>
import { ref } from 'vue';
import { authFetch } from './auth.js';
import Table from './components/Table.vue';

const ncode = ref('n4185ci');
const output = ref('Loading...');
const outputTable = ref(null);
const showTrackBtn = ref(false);
const trackMsg = ref('');
const isAuthenticated = ref(false);

async function fetchNovel(ncodeValue) {
  try {
    const res = await authFetch(`/api/syosetu?ncode=${encodeURIComponent(ncodeValue)}`);
    const full_data = await res.json();
    console.log('API response:', full_data);
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
    output.value = 'Error: ' + err;
    outputTable.value = null;
  }
}

function lookupNcode() {
  fetchNovel(ncode.value || 'n4185ci');
}

async function trackNovel() {
  try {
    const res = await authFetch(`/api/novels/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ncode: ncode.value || 'n4185ci' })
    });
    const text = await res.text();
    trackMsg.value += text;
  } catch (err) {
    trackMsg.value += 'Error: ' + err;
  }
}

outputTable.value = null;
fetchNovel(ncode.value);
</script>

<template>
  <div>
    <h1>Novel Lookup</h1>
    <input type="text" v-model="ncode" placeholder="Enter ncode (e.g. n4185ci)">
    <button @click="lookupNcode">Lookup Ncode</button>
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
    <pre v-else>{{ output }}</pre>
  </div>
</template>
