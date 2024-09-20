<template>
  <div v-if="items && items.length" class="tree-tags">
    <div v-for="item in showTags" :key="item.id"
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
    <div v-if="countAllTag > limit"
      class="tree-tags_more"
      @click="showAll = !showAll">
      <svg class="tree-tags_more-icon"
        :class="{'is-show': showAll}"
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#014a90">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M11.4814 8.17662C11.7887 7.94113 12.2113 7.94113 12.5186 8.17662L20.6542 14.4103C21.0361 14.703 21.1135 15.2565 20.8271 15.6467C20.5406 16.0369 19.9988 16.116 19.6169 15.8233L12 9.987L4.38309 15.8233C4.00118 16.116 3.45937 16.0369 3.17293 15.6467C2.88649 15.2565 2.96389 14.703 3.34581 14.4103L11.4814 8.17662Z"></path>
      </svg>
      <span>{{showAll ? 'Згорнути' : `Розгорнути ще ${countAllTag - limit}` }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue'
import type { RowObject } from "../interfaces/RowObject";

const name = 'TreeTag';
const emit = defineEmits(['click-tag', 'delete-tag']);

const props = defineProps<{
  items: RowObject[],
  limit: {
    type: number,
    default: 10,
  },
  count?: {
    type: number,
    default: 30,
  },
}>();

const showAll = ref(false)

const countAllTag = computed(() => {
  const count = props.items?.length
  if (!count) return 0

  return count > props.count ? props.count : count
});


const showTags = computed(() => {
  if (!countAllTag) {
    return []
  }
  if (showAll.value) {
    return props.items.slice(0, countAllTag.value);
  }
  return props.items.slice(0, props.limit);
});
</script>
