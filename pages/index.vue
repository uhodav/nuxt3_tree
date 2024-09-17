<template>
  <div>
    <div>
      <button @click="getData">getData</button>
    </div>
    <div style="margin: 10px 0">
      <button @click="traverseUpAndExpand(findCode, 'code', true)">find <input v-model="findCode" /></button>
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
    <TreeRoot
      style="width: 1120px; margin: 0 auto; padding: 10px; 1px solid #f8f8f8;"
      :items="data"
      :columns="columns"
      useChecked
      :loading="loading"
      :multiSelect="multiSelect"
      @checked="value => changeChecked(value)"
      @expanded="value => setNodeProps('expanded', value)"
      @checkAll="changeChecked"
      @expandedAll="setNodeProps('expanded')"/>
    <div class="test-values"> {{ checkedIds }} </div>
    <div class="test-values"> {{ checkedItems }} </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { cloneDeep } from 'lodash';
import type { RowObject } from "../interfaces/RowObject";

const name = 'Index';

const data = ref<RowObject[]>([])
const parentToChild = ref(false)
const multiSelect = ref(false)
const loading = ref(false)
const checkedItems = ref<RowObject[]>([])  // выюранные эллементы
const findCode = ref('24222000-6')

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
  } catch (error) {
    console.error('Помилка отримання повідомлень:', error)
  } finally {
    loading.value = false
  }
}

const changeChecked = async (id?: number) => {
  if (!multiSelect.value && checkedIds.value.some((i: number) => i !== id)) {
    // убираем все отметки
    await updateChildrenProp(data.value, 'checked', false);
  }
  await setNodeProps('checked', id);
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
const setNodeProps = (propName: string, id?: number) => {
  return new Promise<void>((resolve) => {
    function findAndUpdate(nodes: any) {
      for (const node of nodes) {
        if (!id || node.id === id) {
          if (node.state) {
            node.state[propName] = !node.state[propName];

            if (parentToChild.value && Array.isArray(node.children)) {
              updateChildrenProp(node.children, propName, node.state[propName]);
            }
          }
          if (id) { // если по конкретному свойству, выходим когда нашли
            return true;
          }
        }

        if (Array.isArray(node.children)) {
          if (id && findAndUpdate(node.children)) {
            return true;
          }
        }
      }

      return false;
    }

    findAndUpdate(data.value);
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

const findNodeAndExpand = (nodes: any, findValue: number | string) => {
    for (const node of nodes) {
      if (node.columns[field].value === findValue) {
        id = node.id
        node.state.expanded = value;
        return node;
      }

      if (Array.isArray(node.children)) {
        const childNode = findNodeAndExpand(node.children, findValue);
        if (childNode) {
          node.state.expanded = value;
          return node;
        }
      }
    }

    return null;
  }

/**
 * ищем эллемент с нужным ключем и сворачиваем/разворачиваем всех родителей
 */
async function traverseUpAndExpand(findValue: number | string, field: string, value: any) {
  let id: any = null
  function findNodeAndExpand(nodes: any, findValue: number | string) {
    for (const node of nodes) {
      if (node.columns[field].value === findValue) {
        id = node.id
        node.state.expanded = value;
        return node;
      }

      if (Array.isArray(node.children)) {
        const childNode = findNodeAndExpand(node.children, findValue);
        if (childNode) {
          node.state.expanded = value;
          return node;
        }
      }
    }
    return null;
  }

  await findNodeAndExpand(data.value, findValue);

  scrollToRow(id)
}
/**
 * Скролл до эллемента
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

    const animateOpacity = () => {
      targetElement.style.opacity = '0';
      setTimeout(() => {
        targetElement.style.opacity = '1';
      }, 500);
    };

    animateOpacity();
    setTimeout(() => {
      animateOpacity();
    }, 1000);
  }
}

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
