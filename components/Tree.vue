<template>
  <div class="tree">
    <div class="tree-header">
      <div class="tree-header_cell tree-header_check">
        <div
          class="checked"
          @click="checkAll"/>
      </div>
      <div class="tree-header_cell tree-header_expanded">
        <div
          v-if="items"
          class="expanded"
          @click="expandedAll"/>
      </div>
      <div v-for="columnItem in columns"
        :key="columnItem.key"
        :class="`tree-header_cell tree-header_${columnItem.key}`">{{ columnItem.label }}</div>
    </div>
    <div class="tree-rows">
      <div v-if="treeText"
        class="tree-text">
        {{ treeText }}
      </div>
      <template v-else>
        <TreeItem v-for="item in items"
          :key="item.id"
          :item="item"
          :columns="columns"
          @checked="onCheck"
          @expanded="onExpanded"/>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from 'vue'
import type { RowObject } from "../interfaces/RowObject";
import type { ColumnObject } from "../interfaces/ColumnObject";
import type { TreeProps } from "../interfaces/TreeProps";

const name = 'Tree';

const emit = defineEmits([
  'update:value',
  'checked',
  'expanded',
  'checkAll',
  'expandedAll'
]);

const props = defineProps<TreeProps>();

const checkAll = () => {
  emit('checkAll')
}
const expandedAll = () => {
  emit('expandedAll')
}

const onCheck = (id: number) => {
  emit("checked", id);
};
const onExpanded = (id: number) => {
  emit("expanded", id);
};

const treeText = computed(() => {
  if (!props.items?.length) {
    return 'Даних немає'
  }
  return ''
});

</script>
