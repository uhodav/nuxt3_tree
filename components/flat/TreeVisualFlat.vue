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
        :indeterminate="hasIndeterminate"
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
    <RecycleScroller
      v-slot="{ item }"
      :items="showData"
      :item-size="30"
      style="height: 300px">
      <TreeItemFlat
        :key="item.id"
        :item="item"
        :useChecked="useChecked"
        :columns="columns"
        @checked="onCheck"
        @expanded="onExpanded"/>
    </RecycleScroller>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits, defineProps, computed } from 'vue'
import type { RowObject } from "../../interfaces/RowObject";
import type { ColumnObject } from "../../interfaces/ColumnObject";
import type { TreeVisualProps } from "../../interfaces/props/TreeVisualProps";
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { RecycleScroller } from 'vue-virtual-scroller';

import TreeItemFlat from './TreeItemFlat.vue'

const name = 'TreeVisualFlat';

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
const expandedRoot = ref(true)

const showData = computed(() => {
  return props.items.filter(i => filterItem(i))
});
const filterItem = (item: RowObject) => {
  if (!item) {
    return false
  }
  /*if (item.level === 0) {
    return true
  }*/
  if (item.state.show || item.state.finded) {
    return true
  }
  return false
};
const checkAll = () => {
  checkedRoot.value = !checkedRoot.value
  emit('checkAll', checkedRoot.value)
}
const expandedAll = () => {
  expandedRoot.value = !expandedRoot.value
  emit('expandedAll', expandedRoot.value)
}
const onCheck = (id: number, state: boolean) => {
  emit("checked", id, state);
};
const onExpanded = (id: number, state: boolean) => {
  emit("expanded", id, state);
};

const hasIndeterminate = computed(() => props.items.some(item => item.state.indeterminate || item.state.checked))

const disabledActions = computed(() => ({
  checked: !(props.multiSelect && props.useChecked && props.items?.length),
  expanded: !props.items?.length
}));
</script>
