<template>
  <div>
    <div>
      <button @click="getData">getData</button>
    </div>
    <div style="margin: 10px 0">
      <button @click="getAllChecked('checked')">getAllChecked</button>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="onlyId" />
        only id: {{ onlyId ? 'on' : 'off' }}
      </label>
    </div>
    <div style="margin: 10px 0">
      <button @click="traverseUpAndExpand('24222000-6')">find 24222000-6</button>
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
      @expanded="value => setProps('expanded', value)"
      @checkAll="changeChecked"
      @expandedAll="setProps('expanded')"/>
    <div class="test-values"> {{ checkedItems }} </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const name = 'Index';

const data = ref<any[]>([])
const parentToChild = ref(false)
const multiSelect = ref(false)
const onlyId = ref(true)
const loading = ref(false)
const checkedItems = ref([])

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
  if (!multiSelect.value) {
    // убираем все отметки
    await updateChildrenProp(data.value, 'checked', false);
  }
  await setProps('checked', id);
  getAllChecked();
};

/**
 * Получить все отмеченные эллементы
 */
const getAllChecked = () => {
  if (!multiSelect.value && checkedItems.value?.length > 1)  {

  }
  checkedItems.value = getRowsByProps('checked', true, onlyId.value ? null : ['code', 'title'])
}


/**
 * Установить значение в конкретный эллемент
 * id - ключ эллемента
 * propName - имя свойства в state
 */
const setProps = (propName: string, id?: number, all?: boolean) => {
  return new Promise<void>((resolve) => {
    function findAndUpdate(nodes) {
      for (const node of nodes) {
        if (!id || node.id === id) {
          if (node.state) {
            node.state[propName] = !node.state[propName];

            if ((all || parentToChild.value) && Array.isArray(node.children)) {
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
function getRowsByProps(propName: string, propValue: any, props: string[] | null) {
  const result: [] = [];
  props = props ?? []

  function findChecked(rows: [any]) {
    for (const row of rows) {
      if (row.state && row.state[propName] === propValue) {
        const values = props.length ? {
          id: row.id
        } : row.id;
        for (const prop of props) {
          values[prop] = row.columns[prop]?.value || null;
        }
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



/** Тестовые методы на подумать */

/**ищем эллемент с нужным значением и разворачиваем всех родителей */
function traverseUpAndExpand(code) {
  function findNodeAndExpand(nodes, code) {
    for (const node of nodes) {
      if (node.columns.code.value === code) {
        node.state.expanded = true;
        return node;
      }

      if (Array.isArray(node.children)) {
        const childNode = findNodeAndExpand(node.children, code);
        if (childNode) {
          node.state.expanded = true; // Проставляем expand родителю
          return node;
        }
      }
    }
    return null;
  }

  findNodeAndExpand(data.value, code);
}
/**Проход сверху вниз (Downward Traversal) */
function traverseDown(tree, callback) {
  callback(tree);

  if (Array.isArray(tree.children)) {
    for (const child of tree.children) {
      traverseDown(child, callback);
    }
  }
}
/*Проход снизу вверх (Upward Traversal)*/
function traverseUp(tree, callback) {
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
