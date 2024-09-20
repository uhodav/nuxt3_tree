<template>
  <div>
    <TreeSearchInput
      v-if="useSearch"
      :items="items"
      @start-search="innerLoading = true"
      @filtered="filteredResult"
      @findedId="showFinded"/>
    <TreeVisual
      :items="filteredData"
      :columns="columns"
      :useChecked="useChecked"
      :loading="loading || innerLoading"
      :multiSelect="multiSelect"
      @checked="value => changeChecked(value)"
      @expanded="value => setNodeProps(filteredData, 'expanded', value)"
      @checkAll="changeChecked"
      @expandedAll="setNodeProps(filteredData, 'expanded')">
      <template v-if="treeText" #treeTextSlot>{{ treeText }}</template>
    </TreeVisual>
    <TreeTag
      v-if="useTags"
      :items="checkedItems"
      @click-tag="val => traverseUpAndExpand(val.columns.code.value, 'code', true)"
      @delete-tag="val => changeChecked(val.id)"/>
  </div>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash';
import type { RowObject } from "../interfaces/RowObject";
import type { TreeProps } from "../interfaces/props/TreeProps";

const name = 'Tree';

const props = defineProps<TreeProps>();
const emit = defineEmits([
  'update:value',
  'click-tag',
  'delete-tag'
]);

const checkedItems = ref<RowObject[]>([])  // выбранные эллементы

const innerLoading = ref(false) // признак загрузки/обработки данных
const filteredData = ref<RowObject[]>([]) // данные для отображения (с учетом строки поиска)
/*const filteredData = computed(() => {
  return props.items;
});*/

onMounted(async () => {
  filteredData.value = props.items
});

watch(() => props.items, (newValue) => {
  console.log('onMounted', newValue)
  filteredData.value = newValue
})
const filteredResult = (val: RowObject[]) => {
  filteredData.value = val;
  innerLoading.value = false
}

const changeChecked = async (id?: number) => {
  if (!props.multiSelect && checkedIds.value.some((i: number) => i !== id)) {
    // убираем все отметки
    await updateChildrenProp(filteredData.value, 'checked', false);
    await updateChildrenProp(props.items, 'checked', false);
  }

  await setNodeProps(filteredData.value, 'checked', id);
  getAllChecked();
};

const checkedIds = computed(() => {
  if (!checkedItems.value?.length) {
    return []
  }
  return checkedItems.value.map((i: RowObject) => i.id)
});
/**
 * Получить все отмеченные эллементы
 */
const getAllChecked = () => {
  checkedItems.value = getRowsByProps('checked', true)
  emit('update:value', checkedItems.value)
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

            if (props.parentToChild && Array.isArray(node.children)) {
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
    //findAndUpdate(props.items);
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

  findChecked(props.items);
  return result;
}
const treeText = computed(() => {
  if (props.items?.length && !filteredData.value?.length) {
    return 'На жаль, за вашим запитом нічого не знайдено.'
  } else if (props.loading || innerLoading.value) {
    return 'Завантаження...'
  } else if (!props.items?.length) {
    return 'Даних немає'
  }
  return null
});
const showFinded = (ids: [number]) => {
  const setNodeExpansion = (node: any) => node.state.expanded = true;
  const isMatchingNode = (node: any, id: number): boolean => node.id === id;
  ids.forEach((id: number) => {
    findAndExpandNode(filteredData.value, id, 'id', true, setNodeExpansion, isMatchingNode);
  });
}

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
</script>
