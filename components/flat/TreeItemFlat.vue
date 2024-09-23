<template>
  <div v-if="item"
    class="tree-row"
    :id="`item-${item.id}`"
    :style="levelStyle"
    :class="rowClasses">
      <TreeAction
        :options="{
          checked: useChecked,
          expanded: item.childrens
        }"
        :disabled="disabledActions"
        :checked="item.state.checked"
        :indeterminate="item.state.indeterminate"
        :expanded="item.state.expanded"
        @checked="onCheck"
        @expanded="onExpanded"/>
      <span v-for="columnItem in columns"
        :class="'col-'+columnItem.key"
        :key="columnItem.key"
        v-html="item.columns[columnItem.key].value"/>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, computed } from 'vue'
import type { TreeRowProps } from "../../interfaces/props/TreeRowProps";

const name = 'TreeItemFlat';

const props = defineProps<TreeRowProps>();

const emit = defineEmits(['checked', 'expanded']);

const onCheck = () => {
  const value = !(props.item.state?.checked ?? true)
  emit('checked', props.item.id, !(props.item.state?.checked ?? true))
};
const onExpanded = () => emit('expanded', props.item.id, !(props.item.state?.expanded ?? true));

const levelStyle = `--level: ${props.item.level}`;

const disabledActions = {
  checked: !props.useChecked
}

const rowClasses = computed(() => ({
  'is-checked': props.item?.state?.checked,
  'is-finded': props.item?.state?.finded,
  'not-select': !props.useChecked
}));
</script>
