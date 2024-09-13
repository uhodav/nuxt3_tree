<template>
  <div>
    <div>
      <button @click="getData">getData</button>
      <label style="margin-left: 10px">
        <input type="checkbox" v-model="parentToChild" />
        parent to child: {{ parentToChild ? 'on' : 'off' }}
      </label>
    </div>
    <div style="margin: 10px 0">
      <button @click="getAllChecked('checked')">getAllChecked</button>
      <button @click="traverseUpAndExpand('24222000-6')">find 24222000-6</button>

    </div>
    <div class="test-values"> {{ checkedItems }} </div>
    <Tree
      :items="data"
      :columns="columns"
      @checked="value => changeProps('checked', value)"
      @expanded="value => changeProps('expanded', value)"
      @checkAll="changeProps('checked', null)"
      @expandedAll="changeProps('expanded', null)"/>
  </div>
</template>
<script setup lang="ts">

const name = 'Index';

const data = ref([])
const parentToChild = ref(false)
const checkedItems = ref([])

const getColumns = ref(['code', 'title'])

const columns = ref([
  {
    key: 'code',
    label: 'code label',
    width: '100px'
  },
  {
    key: 'title',
    label: 'title label',
  }
])

const getData = async () => {
  try {
    const response: any[] = await $fetch(`/api/get-tree`)
    data.value = response
  } catch (error) {
    console.error('Помилка отримання повідомлень:', error)
  }
}
const changeProps = (mode, id) => {
  console.log(mode, id)
  setProps(id, mode).then(() => {
    console.log('Все обновления завершены');
    if (mode === 'checked') {
      getAllChecked(mode)
    }
  });
}
const getAllChecked = (mode) => {
  checkedItems.value = getRowsByProps(['code', 'title'], mode, true)
}


/**
 * Установить значение в конкретный эллемент
 */
const setProps = (id, propName) => {
  return new Promise((resolve) => {
    function findAndUpdate(nodes) {
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
function updateChildrenProp(nodes, propName, state) {
  for (const node of nodes) {
    if (node.state) {
      node.state[propName] = state;
    }
    if (Array.isArray(node.children)) {
      updateChildrenProp(node.children, propName, state);
    }
  }
}

/**
 * получаем свойство строк по состоянию свойства
 *
 */
function getRowsByProps(props, propName, propValue) {
  const result = [];

  function findChecked(rows) {
    for (const row of rows) {
      if (row.state && row.state[propName] === propValue) {
        const values = {};
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
</script>
<style scoped>
.test-values {
  max-height: 200px;
  overflow: auto;
}
</style>
