<template>
  <div>
    <RowAction :item="item"
      :columns="columns"
      :key="item.id"
      @checked="onCheck"
      @expanded="onExpanded">
    </RowAction>
    <template v-if="item.state.expanded">
      <TreeItem v-for="childrenItem in item.children"
        style="margin-left: 15px;"
        :key="childrenItem.id"
        :item="childrenItem"
        :columns="columns"
        @checked="onCheck"
        @expanded="onExpanded"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { TreeRowProps } from "../interfaces/TreeRowProps";

const name = 'TreeItem';

const emit = defineEmits(["checked", "expanded"]);

const props = defineProps<TreeRowProps>();

const onCheck = (id: number) => {
  emit("checked", id);
};
const onExpanded = (id: number) => {
  emit("expanded", id);
};
</script>
