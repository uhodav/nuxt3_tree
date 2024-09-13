<template>
  <RowAction :item="item" :columns="columns"
    :key="item.id"
    @checked="onCheck"
    @expanded="onExpanded">
    <template v-if="item.state.expanded">
      <TreeItem v-for="childrenItem in item.children"
        :key="childrenItem.id"
        :item="childrenItem"
        :columns="columns"
        @checked="onCheck"
        @expanded="onExpanded"/>
    </template>
  </RowAction>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { RowObject } from "../interfaces/RowObject";
import type { ColumnObject } from "../interfaces/ColumnObject";

const name = 'TreeItem';

const emit = defineEmits(["checked", "expanded"]);

const props = defineProps<{
  item: RowObject,
  columns: Array<ColumnObject>
}>()

const onCheck = (id) => {
  emit("checked", id);
};
const onExpanded = (id) => {
  emit("expanded", id);
};
</script>
