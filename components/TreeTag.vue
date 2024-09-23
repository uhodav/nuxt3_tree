<template>
  <div v-if="showTags.length" class="tree-tags">
    <div v-for="item in showTags" :key="item.id"
      class="tree-tags_item"
      @click="emit('click-tag', item)">
      <span class="tree-tags_item-content">
        <template v-if="item.columns">
          <span v-if="item.columns.code" v-html="item.columns.code.value"/>
          <span v-if="item.columns.title" v-html="item.columns.title.value"/>
        </template>
        <span v-else-if="item.id" v-html="item.id"/>
      </span>
      <div class="tree-tags_item-clear"
        @click.stop="emit('delete-tag', item)"/>
    </div>
    <div v-if="countAllTag > limit"
      class="tree-tags_more"
      @click="toggleShowAll">
      <svg class="tree-tags_more-icon"
        :class="{'is-show': showAll}"
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#014a90">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M11.4814 8.17662C11.7887 7.94113 12.2113 7.94113 12.5186 8.17662L20.6542 14.4103C21.0361 14.703 21.1135 15.2565 20.8271 15.6467C20.5406 16.0369 19.9988 16.116 19.6169 15.8233L12 9.987L4.38309 15.8233C4.00118 16.116 3.45937 16.0369 3.17293 15.6467C2.88649 15.2565 2.96389 14.703 3.34581 14.4103L11.4814 8.17662Z"></path>
      </svg>
      <span>{{ showAll ? 'Згорнути' : `Розгорнути ще ${countAllTag - limit}` }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue';
import type { RowObject } from "../interfaces/RowObject";

const name = 'TreeTag';
const emit = defineEmits(['click-tag', 'delete-tag']);

const props = defineProps<{
  items: RowObject[],
  limit: number,
  count?: number,
}>();

const showAll = ref(false);
const countAllTag = computed(() => Math.min(props.items.length || 0, props.count ?? 30));

const showTags = computed(() => showAll.value ? props.items.slice(0, countAllTag.value) : props.items.slice(0, props.limit));

const toggleShowAll = () => showAll.value = !showAll.value;
</script>
