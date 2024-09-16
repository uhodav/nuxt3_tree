<template>
  <div>
    <TreeRow :item="item"
      :columns="columns"
      :key="item.id"
      :level="level"
      :useChecked="useChecked"
      @checked="onCheck"
      @expanded="onExpanded">
    </TreeRow>
    <template v-if="item.state.expanded">
      <TreeItem v-for="childrenItem in item.children"
        :level="level + 1"
        :key="childrenItem.id"
        :item="childrenItem"
        :useChecked="useChecked"
        :columns="columns"
        @checked="onCheck"
        @expanded="onExpanded"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { TreeItemProps } from "../interfaces/props/TreeItemProps";

const name = 'TreeItem';

const emit = defineEmits(["checked", "expanded"]);

const props = defineProps<TreeItemProps>();

const onCheck = (id: number) => {
  emit("checked", id);
};
const onExpanded = (id: number) => {
  emit("expanded", id);
};
</script>
