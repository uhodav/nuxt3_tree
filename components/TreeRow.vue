<template>
  <div v-if="item"
    class="tree-row"
    :id="`item-${item.id}`"
    :style="`--level: ${level}`"
    :class="rowClasses">
      <TreeAction
        :options="{
          checked: useChecked,
          expanded: item.children && item.children.length
        }"
        :disabled="disabledActions"
        :checked="isChecked"
        :expanded="item.state && item.state.expanded"
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
import type { TreeRowProps } from "../interfaces/props/TreeRowProps";

const name = 'TreeRow';

const props = defineProps<TreeRowProps>();

const emit = defineEmits(['checked', 'expanded']);

const onCheck = () => emit('checked', props.item.id);
const onExpanded = () => emit('expanded', props.item.id);

const isChecked = props.item?.state?.checked || false;
const isFinded = props.item?.state?.finded || false;
const isExpanded = props.item?.state?.expanded || false;
const hasChildren = !!props.item.children?.length;

const levelStyle = `--level: ${props.level}`;

const disabledActions = {
  checked: !props.useChecked
}

const rowClasses = computed(() => ({
  'is-checked': isChecked,
  'is-finded': isFinded,
  'not-select': !props.useChecked
}));
</script>
