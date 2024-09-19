<template>
  <div>
    <div class="tree-search_input"
      :class="{'is-disabled': searching}">
      <input
        :disabled="!items || !items.length"
        v-model="findText" />
      <button class="tree-search_button"
        @click="debouncedUpdate(findText)">
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M21 42C32.598 42 42 32.598 42 21C42 9.40202 32.598 0 21 0C9.40202 0 0 9.40202 0 21C0 32.598 9.40202 42 21 42Z" fill="#7A98B4"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M25.2854 13.681C24.294 14.0848 23.8289 15.1891 24.2464 16.1476C24.9419 17.7442 24.9451 19.5626 24.2157 21.1798C23.9913 21.6774 23.7099 22.1294 23.3831 22.5314C23.2283 22.6112 23.0822 22.7127 22.9495 22.836C22.7767 22.9965 22.6412 23.1804 22.5431 23.3775C20.8394 24.7822 18.4434 25.1746 16.3195 24.2043C13.2876 22.8187 11.9278 19.1744 13.3245 16.0785C14.5847 13.2838 17.6714 11.9001 20.5069 12.7816C21.531 13.0999 22.6281 12.5553 22.9573 11.5651C23.2866 10.5749 22.7233 9.51417 21.6993 9.19582C16.9431 7.71727 11.807 10.0197 9.75388 14.5728C7.52397 19.5153 9.6992 25.3448 14.6551 27.6097C17.8881 29.0867 21.4921 28.6776 24.2428 26.8561L29.1514 31.7964C29.8966 32.5465 31.1296 32.5704 31.9053 31.8498C32.6811 31.1293 32.7058 29.9371 31.9605 29.187L26.9651 24.1593C27.2754 23.6996 27.5509 23.2077 27.7864 22.6854C28.9466 20.1131 28.9415 17.2224 27.8364 14.6856C27.4189 13.727 26.2767 13.2773 25.2854 13.681Z" fill="#FEFEFE"/>
        </svg>
      </button>
    </div>
    <div class="tree-search_result">
      <div v-if="findText">
        <b>Знайдено:</b>
        <span style="margin-left: 5px">{{ findedId.length }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { debounce } from 'lodash';
import { ref, defineEmits, defineProps, watch } from 'vue'
import type { RowObject } from "../interfaces/RowObject";

const name = 'TreeSearchInput';

const emit = defineEmits(['filtered', 'findedId', 'start-search']);

const findText = ref<string>('');
const findedId = ref<number[]>([]);
const searching = ref<boolean>(false);

const props = defineProps<{
  items: RowObject[];
}>();

const debouncedUpdate = debounce((value: string) => {
  emit('start-search');
  searching.value = true
  let filteredItems = props.items
  findedId.value = []
  if (value) {
    filteredItems = filterItems(props.items, value)
  } else {
    filteredItems = resetItems(props.items)
  }
  emit('filtered', filteredItems);
  emit('findedId', findedId.value);
  searching.value = false
}, 300);

const highlightMatch = (text: string, searchText: string): string => {
  const index = text.toLowerCase().indexOf(searchText);
  if (index === -1) return text;
  const beforeMatch = text.slice(0, index);
  const match = text.slice(index, index + searchText.length);
  const afterMatch = text.slice(index + searchText.length);
  return `${beforeMatch}<b>${match}</b>${afterMatch}`;
};
const removeHighlight = (text: string): string => {
  return text.replace(/<\/?b>/g, '');
};

const resetItems = (items: RowObject[]): RowObject[] => {
  const resetItemsRecursive = (nodes: RowObject[]): RowObject[] => {
    return nodes.filter(node => {
      node.columns.code.value = removeHighlight(node.columns.code.value);
      node.columns.title.value = removeHighlight(node.columns.title.value);
      node.state.finded = false
      node.state.expanded = false

      if (Array.isArray(node.children)) {
        const filteredChildren = resetItemsRecursive(node.children);
        if (filteredChildren.length > 0) {
          node.children = filteredChildren;
          return true;
        }
      }

      return true;
    });
  };

  return resetItemsRecursive(items);
}

const filterItems = (items: RowObject[], findText: string): RowObject[] => {
  const searchText = findText.toLowerCase();

  const filterRecursive = (nodes: RowObject[]): RowObject[] => {
    return nodes.filter(node => {
      const codeContainsText = node.columns.code.value.toLowerCase().includes(searchText);
      const titleContainsText = node.columns.title.value.toLowerCase().includes(searchText);

      if (codeContainsText) {
        node.columns.code.value = highlightMatch(node.columns.code.value, searchText);
      } else {
        node.columns.code.value = removeHighlight(node.columns.code.value);
      }

      if (titleContainsText) {
        node.columns.title.value = highlightMatch(node.columns.title.value, searchText);
      } else {
        node.columns.title.value = removeHighlight(node.columns.title.value);
      }
      if (codeContainsText || titleContainsText) {
        node.state.finded = true
        findedId.value = [...findedId.value, node.id]
        return true;
      }

      if (Array.isArray(node.children)) {
        const filteredChildren = filterRecursive(node.children);
        if (filteredChildren.length > 0) {
          node.children = filteredChildren;
          return true;
        }
      }

      return false;
    });
  };

  return filterRecursive(items);
}
watch(findText, (newValue) => {
  debouncedUpdate(newValue);
});
</script>
<style scoped>
</style>
