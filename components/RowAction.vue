<template>
  <div v-if="item"
    class="tree-row"
    :class="{'is-checked': isChecked}">
      <div
        class="checked"
        :class="{'is-active': isChecked}"
        @click="onCheck"/>
      <div
        v-if="item.children"
        class="expanded"
        :class="{'is-active': item.state && item.state.expanded}"
        @click="onExpanded"/>
      <div v-else class="expanded is-blank"></div>
      <span v-for="columnItem in columns"
        :class="'col-'+columnItem.key"
        :key="columnItem.key">
        <template v-if="columnItem"></template>
        {{ item.columns[columnItem.key].value }}</span>
    <div v-if="$slots.default"
      class="tree-row"
      style="margin-left: 15px;">
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, computed } from 'vue'
import type { RowObject } from "../interfaces/RowObject";
import type { ColumnObject } from "../interfaces/ColumnObject";

const name = 'RowAction';

const props = defineProps<{
  item: RowObject,
  columns: Array<ColumnObject>
}>()

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

<style scoped>

</style>
