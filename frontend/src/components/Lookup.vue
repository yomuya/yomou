<template>
  <div>
    <h1>Syosetu API Info</h1>
    <button @click="goToDashboard">Go to Dashboard</button>
    <input type="text" v-model="ncode" placeholder="Enter ncode (e.g. n4185ci)">
    <button @click="lookupNcode">Lookup Ncode</button>
    <button v-show="showTrackBtn" @click="trackNovel">Track Novel</button>
    <p v-show="trackMsg" v-html="trackMsg"></p>
    <pre>{{ output }}</pre>
  </div>
</template>

<script>
import { authFetch } from '../auth.js';

export default {
  name: 'Lookup',
  data() {
    return {
      ncode: 'n4185ci',
      output: 'Loading...',
      showTrackBtn: false,
      trackMsg: '',
      isAuthenticated: false
    };
  },
  methods: {
    goToDashboard() {
      window.location.href = '/';
    },
    async fetchNovel(ncode) {
      try {
        const res = await authFetch(`/api/syosetu?ncode=${encodeURIComponent(ncode)}`);
        const data = await res.json();
        this.output = JSON.stringify(data, null, 2);
        this.showTrackBtn = true;
      } catch (err) {
        this.output = 'Error: ' + err;
      }
    },
    lookupNcode() {
      this.fetchNovel(this.ncode || 'n4185ci');
    },
    async trackNovel() {
      try {
        const res = await authFetch(`/api/novels/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ncode: this.ncode || 'n4185ci' })
        });
        const text = await res.text();
        this.trackMsg += text;
      } catch (err) {
        this.trackMsg += 'Error: ' + err;
      }
    }
  },
  async mounted() {
    this.fetchNovel(this.ncode);
  }
};
</script>
