<template>
  <div class="tree-search">
    <div class="tree-search_input"
      :class="{'is-disabled': searching, 'has-value': findText}">
      <svg class="tree-search_input-icon"
        width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.30509 0.5C3.09903 0.5 0.5 3.09903 0.5 6.30509C0.5 9.51114 3.09903 12.1102 6.30509 12.1102C7.64849 12.1102 8.88532 11.6538 9.86901 10.8877L14.2703 15.289C14.5516 15.5703 15.0077 15.5703 15.289 15.289C15.5703 15.0077 15.5703 14.5516 15.289 14.2703L10.8877 9.86901C11.6538 8.88532 12.1102 7.64849 12.1102 6.30509C12.1102 3.09903 9.51114 0.5 6.30509 0.5ZM1.94068 6.30509C1.94068 3.89469 3.89469 1.94068 6.30509 1.94068C8.71548 1.94068 10.6695 3.89469 10.6695 6.30509C10.6695 8.71548 8.71548 10.6695 6.30509 10.6695C3.89469 10.6695 1.94068 8.71548 1.94068 6.30509Z" fill="#9B9B9B"/>
      </svg>
      <input
        :disabled="!items || !items.length"
        v-model="findText" />
      <svg v-if="findText"
       class="tree-search_input-clear"
        width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        @click="findText = null">
        <path d="M16.4553 4.56556C16.7372 4.28365 16.7372 3.82659 16.4553 3.54468C16.1734 3.26278 15.7163 3.26278 15.4344 3.54468L10 8.97907L4.56568 3.5447C4.28377 3.26279 3.82671 3.26279 3.5448 3.5447C3.2629 3.82661 3.2629 4.28367 3.5448 4.56558L8.97917 9.99994L3.54485 15.4343C3.26294 15.7162 3.26294 16.1732 3.54485 16.4551C3.82676 16.737 4.28382 16.737 4.56572 16.4551L10 11.0208L15.4344 16.4552C15.7163 16.7371 16.1733 16.7371 16.4553 16.4552C16.7372 16.1732 16.7372 15.7162 16.4553 15.4343L11.0209 9.99994L16.4553 4.56556Z" fill="#4A4A4A"/>
      </svg>
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
