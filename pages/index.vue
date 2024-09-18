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
        multiSelect: {{ multiSelect ? 'on' : 'off' }}
      </label>
    </div>
    <TreeSearchInput
      :items="data"
      @start-search="loading = true"
      @filtered="filteredResult"
      @findedId="showFinded"/>
    <TreeRoot
      :items="filteredData"
      :columns="columns"
      useChecked
      :loading="loading"
      :multiSelect="multiSelect"
      @checked="value => changeChecked(value)"
      @expanded="value => setNodeProps(filteredData, 'expanded', value)"
      @checkAll="changeChecked"
      @expandedAll="setNodeProps(filteredData, 'expanded')">
      <template v-if="treeText" #treeTextSlot>{{ treeText }}</template>
    </TreeRoot>
    <div class="test-values"> {{ checkedIds }} </div>
    <div class="test-values"> {{ checkedItems }} </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { cloneDeep } from 'lodash';
import type { RowObject } from "../interfaces/RowObject";

const name = 'Index';

const data = ref<RowObject[]>([]) // изначальный набор данных
const filteredData = ref<RowObject[]>([]) // данные для отображения (с учетом строки поиска)

const parentToChild = ref(false)  // признак родителя прокидывать в детей
const multiSelect = ref(false)  // возможность выбирать несколько значений
const loading = ref(true) // признак загрузки/обработки данных
const checkedItems = ref<RowObject[]>([])  // выбранные эллементы
const findCode = ref('24311120-4')

const getColumns = ref(['code', 'title'])

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
    filteredData.value = response
  } catch (error) {
    console.error('Помилка отримання повідомлень:', error)
  } finally {
    loading.value = false
  }
}

const filteredResult = (val: RowObject[]) => {
  filteredData.value = val;
  loading.value = false
}

const changeChecked = async (id?: number) => {
  if (!multiSelect.value && checkedIds.value.some((i: number) => i !== id)) {
    // убираем все отметки
    await updateChildrenProp(filteredData.value, 'checked', false);
    await updateChildrenProp(data.value, 'checked', false);
  }

  await setNodeProps(filteredData.value, 'checked', id);
  getAllChecked();
};

/**
 * Получить все отмеченные эллементы
 */
const getAllChecked = () => {
  checkedItems.value = getRowsByProps('checked', true)
}

/**
 * Установить значение в конкретный эллемент
 * id - ключ эллемента
 * propName - имя свойства в state
 */
const setNodeProps = (dataItems: RowObject[], propName: string, id?: number) => {
  return new Promise<void>((resolve) => {
    const findAndUpdate = (nodes: RowObject[]) => {

      for (const node of nodes) {
        if (!id || node.id === id) {
          if (node.state) {
            node.state[propName] = !node.state[propName];

            if (parentToChild.value && Array.isArray(node.children)) {
              updateChildrenProp(node.children, propName, node.state[propName]);
            }
          }
          if (id) {
            return true;
          }
        }

        if (id && Array.isArray(node.children)) {
          if (findAndUpdate(node.children)) {
            return true;
          }
        }
      }

      return false;
    }

    findAndUpdate(dataItems);
    //findAndUpdate(data.value);
    //findAndUpdate(filteredData.value);
    resolve();
  });
}

/**
 * Применяем к детям значение
 */
function updateChildrenProp(nodes: any, propName: string, state: any) {
  return new Promise<void>((resolve) => {
    for (const node of nodes) {
      if (node.state) {
        node.state[propName] = state;
      }
      if (Array.isArray(node.children)) {
        updateChildrenProp(node.children, propName, state);
      }
    }
    resolve();
  });
}

/**
 * получаем свойство строк по состоянию свойства
 * propName - имя свойства которое ищем
 * propValue - значение которое ищем
 * props - массив имен полей которые возвращаем
 */
function getRowsByProps(propName: string, propValue: any) {
  const result: RowObject[] = [];

  function findChecked(rows: RowObject[]) {
    for (const row of rows) {
      if (row.state && row.state[propName] === propValue) {
        const getItem = (item: RowObject) => {
          const result = cloneDeep(item)
          delete result.children
          delete result.state
          return result
        }

        const values: (RowObject) = getItem(row);
        result.push(values);
      }
      if (Array.isArray(row.children) && row.children.length > 0) {
        findChecked(row.children);
      }
    }
  }

  findChecked(data.value);
  return result;
}

//indeterminate
const showFinded = (ids: [number]) => {
  const setNodeExpansion = (node: any) => node.state.expanded = true;
  const isMatchingNode = (node: any, id: number): boolean => node.id === id;
  ids.forEach((id: number) => {
    findAndExpandNode(filteredData.value, id, 'id', true, setNodeExpansion, isMatchingNode);
  });
}

const treeText = computed(() => {
  if (data.value?.length && !filteredData.value?.length) {
    return 'На жаль, за вашим запитом нічого не знайдено.'
  } else if (loading.value) {
    return 'Завантаження...'
  } else if (!data.value?.length) {
    return 'Даних немає'
  }
  return null
});

///////////////////////// разворот до нужного ////////////////////////////
/**
 * Ищет узел и расширяет/сворачивает его и всех родителей.
 * @param nodes Список узлов для поиска.
 * @param findValue Значение для поиска.
 * @param fieldValidate Поле для проверки.
 * @param newValue Состояние для установки.
 * @param setNodeExpansion функция для изменения состояния
 * @returns Найденный узел или null.
 */
const findAndExpandNode = (
  nodes: any[],
  findValue: number | string,
  fieldValidate: string,
  newValue: boolean,
  setNodeExpansion: Function,
  isMatchingNode: Function,
): any | null => {
  let foundNode: any = null;

  for (const node of nodes) {
    if (isMatchingNode(node, findValue, fieldValidate)) {
      setNodeExpansion(node, newValue);
      foundNode = node;
      break;
    }

    if (Array.isArray(node.children)) {
      const childNode = findAndExpandNode(node.children, findValue, fieldValidate, newValue, setNodeExpansion, isMatchingNode);
      if (childNode) {
        setNodeExpansion(node, newValue);
        foundNode = childNode;
        break;
      }
    }
  }

  return foundNode;
};

/**
 * Расширяет/сворачивает узел и всех его родителей и скроллит до узла.
 * @param findValue Значение для поиска.
 * @param fieldValidate Поле для проверки.
 * @param newValue Состояние для установки.
 */
async function traverseUpAndExpand(findValue: number | string, fieldValidate: string, newValue: boolean) {
  const setNodeExpansion = (node: any, expanded: boolean) => node.state.expanded = expanded;
  const isMatchingNode = (node: any, findValue: number | string, field: string): boolean =>
  node.columns[field].value === findValue;

  const node = findAndExpandNode(filteredData.value, findValue, fieldValidate, newValue, setNodeExpansion, isMatchingNode);

  if (node) {
    setTimeout(() => {
      scrollToRow(node.id);
    }, 500);
  }
}
///////////////////////// разворот до нужного ////////////////////////////

/**
 * Скроллит до указанного элемента.
 * @param id ID элемента для скролла.
 */
const scrollToRow = (id: number) => {
  const treeRows = document.querySelector('.tree-rows');
  const targetElement = treeRows?.querySelector(`#item-${id}`);

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    targetElement.style.transition = 'opacity 0.5s';
    targetElement.style.opacity = '0';

    setTimeout(() => {
      targetElement.style.opacity = '1';
    }, 500);

    setTimeout(() => {
      targetElement.style.opacity = '0';
      setTimeout(() => {
        targetElement.style.opacity = '1';
      }, 500);
    }, 1000);
  }
};

const checkedIds = computed(() => {
  if (!checkedItems.value?.length) {
    return []
  }
  return checkedItems.value.map((i: RowObject) => i.id)
});






/** Тестовые методы на подумать */

/**Проход сверху вниз (Downward Traversal) */
function traverseDown(tree: { children: any; }, callback: (arg0: any) => void) {
  callback(tree);

  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      traverseDown(child, callback);
    }
  }
}
/*Проход снизу вверх (Upward Traversal)*/
function traverseUp(tree: { children: any; }, callback: (arg0: any) => void) {
  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      traverseUp(child, callback);
    }
  }
  callback(tree);
}

onMounted(() => {
  getData()
})
</script>
<style scoped>
.test-values {
  max-height: 200px;
  overflow: auto;
}
</style>
