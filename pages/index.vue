<template>
  <div
    style="width: 1120px; margin: 0 auto; padding: 10px; 1px solid #f8f8f8;">
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
        <input type="checkbox" v-model="useTags" />
        use tags: {{ useTags ? 'on' : 'off' }}
      </label>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="useChecked" />
        use checked: {{ useChecked ? 'on' : 'off' }}
      </label>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="openAfterSelect" />
        open after select: {{ openAfterSelect ? 'on' : 'off' }}
      </label>
    </div>
    <TreeFlat
      ref="treeRef"
      :items="data"
      :value="checkedItems"
      :columns="columns"
      :loading="loading"
      :parentToChild="parentToChild"
      :openAfterSelect="openAfterSelect"
      :useChecked="useChecked"
      :useSearch="useSearch"
      :useTags="useTags"
      :multiSelect="multiSelect"
      @update:value="val => checkedItems = val"/>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { RowObject } from "../interfaces/RowObject";
import TreeFlat from './components/flat/TreeFlat.vue'

const name = 'Index';

const treeRef = ref<HTMLElement | null>(null);

const data = ref<RowObject[]>([]) // изначальный набор данных

const loading = ref(true) // признак загрузки/обработки данных
const parentToChild = ref(false)  // признак родителя прокидывать в детей
const useChecked = ref(true)  // отображение выбора эллементов
const openAfterSelect = ref(false)  // разворачивать после выбора
const useSearch = ref(true)  // отображение поиска
const useTags = ref(true)  // отображение тегов
const multiSelect = ref(false)  // возможность выбирать несколько значений

const checkedItems = ref<RowObject[]>([
  {
    id: 19237,
  },
  {
    id: 21771,
  }
])  // выбранные эллементы
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
