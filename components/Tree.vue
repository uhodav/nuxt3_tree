<template>
  <div class="tree">
    <div class="tree-header">
      <div class="tree-header_check">
        <div
          class="checked"
          @click="checkAll"/>
      </div>
      <div class="tree-header_expanded">
        <div
          v-if="items"
          class="expanded"
          @click="expandedAll"/>
      </div>
      <div v-for="columnItem in columns"
        :key="columnItem.key"
        :class="`tree-header_${columnItem.key}`"
        :style="columnItem.width ? `width: ${columnItem.width}` : ''">{{ columnItem.label }}</div>
    </div>
    <div class="tree-rows">
      <TreeItem v-for="item in items"
        :key="item.id"
        :item="item"
        :columns="columns"
        @checked="onCheck"
        @expanded="onExpanded"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'
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

const props = defineProps<{
  value: Array<any> | any,
  columns: Array<ColumnObject>
  items: Array<RowObject>,
}>()


const checkAll = () => {
  emit('checkAll')
}
const expandedAll = () => {
  emit('expandedAll')
}

const onCheck = (id) => {
  emit("checked", id);
};
const onExpanded = (id) => {
  emit("expanded", id);
};
</script>
