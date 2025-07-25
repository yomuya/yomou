<script setup>
import { ref } from 'vue'
import GeneralSettingsTab from './settings/GeneralSettingsTab.vue'
import TableSettingsTab from './settings/TableSettingsTab.vue'
import NavbarSettingsTab from './settings/NavbarSettingsTab.vue'
import ReaderSettingsTab from './settings/ReaderSettingsTab.vue'

const tabs = [
  { key: 'general', label: 'General', component: GeneralSettingsTab },
  { key: 'table', label: 'Table', component: TableSettingsTab },
  { key: 'navbar', label: 'Navbar', component: NavbarSettingsTab },
]
const activeTab = ref('general')
</script>

<template>
  <div>
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{active: activeTab === tab.key}"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <component
      v-for="tab in tabs"
      :is="tab.component"
      v-show="activeTab === tab.key"
      :key="tab.key"
    />
  </div>
</template>
