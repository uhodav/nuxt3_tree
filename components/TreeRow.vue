<template>
  <div v-if="item"
    class="tree-row"
    :id="`item-${item.id}`"
    :class="{'is-checked': isChecked, 'not-select': !useChecked}">
      <TreeAction
        :style="`margin-left: ${level * 15}px;`"
        :options="{
          checked: useChecked,
          expanded: item.children && item.children.length
        }"
        :disabled="{
          checked: !useChecked
        }"
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

const emit = defineEmits(["checked", "expanded"]);

const onCheck = () => {
  emit("checked", props.item.id);
};
const onExpanded = () => {
  emit("expanded", props.item.id);
};

const isChecked = computed(() => {
  return props.item?.state?.checked || false
});

</script>
