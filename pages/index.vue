<template>
  <div
    style="width: 1120px; margin: 0 auto; padding: 10px; 1px solid #f8f8f8;">
    <div style="margin: 10px 0">
      <button @click="traverseUpAndExpand(findCode, 'code', true)">GoTo code <input v-model="findCode" /></button>
    </div>
    <div>
      <div>Tree props: </div>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="parentToChild" />
        parent to child: {{ parentToChild ? 'on' : 'off' }}
      </label>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="multiSelect" />
        multi select: {{ multiSelect ? 'on' : 'off' }}
      </label>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="useSearch" />
        use search: {{ useSearch ? 'on' : 'off' }}
      </label>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="useChecked" />
        use checked: {{ useChecked ? 'on' : 'off' }}
      </label>
    </div>
    <Tree
      ref="treeRef"
      :items="data"
      :value="checkedItems"
      :columns="columns"
      :loading="loading"
      :parentToChild="parentToChild"
      :useChecked="useChecked"
      :useSearch="useSearch"
      :multiSelect="multiSelect"
      @update:value="val => checkedItems = val"/>
    <div class="test-values"> {{ checkedItems }} </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RowObject } from "../interfaces/RowObject";

const name = 'Index';

const treeRef = ref<HTMLElement | null>(null);

const data = ref<RowObject[]>([]) // изначальный набор данных

const loading = ref(true) // признак загрузки/обработки данных
const parentToChild = ref(false)  // признак родителя прокидывать в детей
const useChecked = ref(true)  // отображение выбора эллементов
const useSearch = ref(true)  // отображение поиска
const multiSelect = ref(false)  // возможность выбирать несколько значений

const checkedItems = ref<RowObject[]>([])  // выбранные эллементы
const findCode = ref('24311120-4')

const columns = ref([
  {
    key: 'code',
    label: 'Код CVP (ДК)',
  },
  {
    key: 'title',
    label: 'Назва категорії',
  }
])

const getData = async () => {
  loading.value = true
  try {
    const response: any[] = await $fetch(`/api/get-tree`)
    data.value = response
    //filteredData.value = response
  } catch (error) {
    console.error('Помилка отримання повідомлень:', error)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  getData()
})

//indeterminate

/** Тестовые методы на подумать */

/**Проход сверху вниз (Downward Traversal) */
/*function traverseDown(tree: { children: any; }, callback: (arg0: any) => void) {
  callback(tree);

  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      traverseDown(child, callback);
    }
  }
}*/
/*Проход снизу вверх (Upward Traversal)*/
/*function traverseUp(tree: { children: any; }, callback: (arg0: any) => void) {
  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      traverseUp(child, callback);
    }
  }
  callback(tree);
}*/

</script>
<style scoped>
.test-values {
  max-height: 200px;
  overflow: auto;
}
</style>
