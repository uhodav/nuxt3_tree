<template>
  <div v-if="items && items.length" class="tree-tags">
    <div v-for="item in items" :key="item.id"
      class="tree-tags_item"
      @click="emit('click-tag', item)">
      <span class="tree-tags_item-content">
        <template v-if="item.columns.code">{{item.columns.code.value}}</template>
        <template v-if="item.columns.title">{{item.columns.title.value}}</template>
      </span>
      <div class="tree-tags_item-clear"
        @click.stop="emit('delete-tag', item)">
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { RowObject } from "../interfaces/RowObject";

const name = 'TreeTag';
const emit = defineEmits(['click-tag', 'delete-tag']);

const props = defineProps<{
  items: RowObject[];
}>();
</script>
<style scoped>
.tree-tags {
  max-height: 200px;
  overflow: auto;
}
</style>
