<script setup>
import { useSlots, computed } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  columns: { type: Array, required: true },
  rowKey: { type: String, required: true },
  showHeaders: { type: Boolean, default: true }
});

const normalizedColumns = computed(() =>
  props.columns.map(col =>
    typeof col === 'string' ? { key: col, label: col } : col
  )
);

const slots = useSlots();
</script>

<template>
  <table v-if="items.length > 0">
    <thead v-if="showHeaders">
      <tr>
        <th v-for="col in normalizedColumns" :key="col.key">{{ col.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item[rowKey]">
        <template v-for="col in normalizedColumns" :key="col.key">
          <td>
            <slot
              :name="`cell-${col.key}`"
              :item="item"
              :col="col"
            >
              {{ item[col.key] }}
            </slot>
          </td>
        </template>
      </tr>
    </tbody>
  </table>
  <div v-else>
    <slot name="empty">No data</slot>
  </div>
</template>


<style scoped lang="scss">
@use '../styles/table_component.scss';
</style>
