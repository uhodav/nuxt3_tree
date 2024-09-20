<template>
  <div
    class="tree-actions">
    <div
      v-if="options.checked"
      class="checked"
      :class="{'is-active': checked, 'is-disabled': disabled.checked}"
      @click="onSendEvent('checked', !checked)"/>
    <div
      v-if="options.expanded"
      class="expanded"
      :class="{'is-active': expanded, 'is-disabled': disabled.expanded}"
      @click="onSendEvent('expanded', !expanded)">
      <svg xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="#014a90"
        class="smt-icon">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M15.8234 11.4814C16.0589 11.7887 16.0589 12.2113 15.8234 12.5186L9.58965 20.6542C9.29701 21.0361 8.74348 21.1135 8.3533 20.8271C7.96311 20.5406 7.88404 19.9988 8.17667 19.6169L14.013 12L8.17667 4.38309C7.88404 4.00118 7.96311 3.45937 8.3533 3.17293C8.74348 2.88649 9.29702 2.96389 9.58965 3.34581L15.8234 11.4814Z"/>
      </svg>
    </div>
    <div v-else class="expanded is-blank"></div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import type { TreeActionProps } from "../interfaces/props/TreeActionProps";

const props = defineProps<TreeActionProps>();

const emit = defineEmits(["checked", "expanded"]);

const onSendEvent = (eventName: string, state: Boolean) => {
  emit(eventName, state);
}
</script>
