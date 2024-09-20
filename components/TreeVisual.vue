<template>
  <div class="tree">
    <div class="tree-header"
      :class="{'not-select': !useChecked}">
      <TreeAction
        class="tree-header_cell tree-header_action"
        :options="{
          checked: useChecked,
          expanded: true
        }"
        :disabled="disabledActions"
        :checked="checkedRoot"
        :expanded="expandedRoot"
        @checked="checkAll"
        @expanded="expandedAll"/>
      <div v-for="columnItem in columns"
        :key="columnItem.key"
        class="tree-header_cell"
        :class="`tree-header_${columnItem.key}`">{{ columnItem.label }}</div>
    </div>
    <div v-if="slots.treeTextSlot"
      class="tree-info">
      <span class="tree-info_text">
        <slot name="treeTextSlot">
          {{ treeText }}
        </slot>
      </span>
    </div>
    <div v-else
      class="tree-rows">
      <TreeItem v-for="item in items"
        :key="item.id"
        :item="item"
        :level="0"
        :useChecked="useChecked"
        :columns="columns"
        @checked="onCheck"
        @expanded="onExpanded"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from 'vue'
import type { RowObject } from "../interfaces/RowObject";
import type { ColumnObject } from "../interfaces/ColumnObject";
import type { TreeVisualProps } from "../interfaces/props/TreeVisualProps";

const name = 'TreeRoot';

const emit = defineEmits([
  'update:value',
  'checked',
  'expanded',
  'checkAll',
  'expandedAll'
]);
const instance = getCurrentInstance()
const slots = instance?.slots || {}

const props = defineProps<TreeVisualProps>();

const checkedRoot = ref(false)
const expandedRoot = ref(false)

const checkAll = () => {
  checkedRoot.value = !checkedRoot.value
  emit('checkAll', checkedRoot.value)
}
const expandedAll = () => {
  expandedRoot.value = !expandedRoot.value
  emit('expandedAll', expandedRoot.value)
}

const onCheck = (id: number) => {
  emit("checked", id);
};
const onExpanded = (id: number) => {
  emit("expanded", id);
};

const disabledActions = computed(() => ({
  checked: !(props.multiSelect && props.useChecked && props.items?.length),
  expanded: !props.items?.length
}));
</script>
