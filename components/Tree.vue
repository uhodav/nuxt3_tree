<template>
  <div class="tree">
    <div class="tree-header">
      <TreeAction
        class="tree-header_cell tree-header_action"
        :options="{
          checked: useChecked,
          expanded: true
        }"
        :disabled="{
          checked: !useChecked || !(items && !!items.length),
          expanded: !items || !items.length
        }"
        :checked="checkedRoot"
        :expanded="expandedRoot"
        @checked="checkAll"
        @expanded="expandedAll"/>
      <div v-for="columnItem in columns"
        :key="columnItem.key"
        :class="`tree-header_cell tree-header_${columnItem.key}`">{{ columnItem.label }}</div>
    </div>
    <div class="tree-rows">
      <div v-if="treeText"
        class="tree-text-info">
        {{ treeText }}
      </div>
      <template v-else>
        <TreeItem v-for="item in items"
          :key="item.id"
          :item="item"
          :level="0"
          :useChecked="useChecked"
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
import type { TreeProps } from "../interfaces/props/TreeProps";

const name = 'Tree';

const emit = defineEmits([
  'update:value',
  'checked',
  'expanded',
  'checkAll',
  'expandedAll'
]);

const props = defineProps<TreeProps>();

const checkedRoot = ref(false)
const expandedRoot = ref(true)

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
