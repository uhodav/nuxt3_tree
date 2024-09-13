<template>
  <div style="display: grid;">
    <div style="background: rgb(239 239 239); padding: 4px; border-radius: 2px; margin-bottom: 2px;">
      <div
        class="checked"
        :class="{'is-active': item.state && item.state.checked}"
        @click="onCheck"/>
      <div
        v-if="item.children"
        class="expanded"
        :class="{'is-active': item.state && item.state.expanded}"
        @click="onExpanded"/>
      <div v-else class="expanded is-blank"></div>
      <span v-for="columnItem in columns"
        :class="'col-'+columnItem.key"
        :key="columnItem.key">{{ item.columns[columnItem.key].value }}</span>
    </div>
    <div v-if="$slots.default"
      style="margin-left: 15px; display: grid;">
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
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

const rowClass = computed(() => {
  return []

});

</script>

<style scoped>
div {
  display: flex;
}
</style>
