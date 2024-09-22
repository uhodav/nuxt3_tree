<template>
  <div>
    <template v-if="useSearch">
      <TreeSearchInputFlat
        ref="treeSearchInput"
        :items="flatData"
        :disabled="innerLoading"
        @start-search="innerLoading = true"
        @search="startSearch"/>
      <div class="tree-search_result">
        <div v-if="findedItems.length">
          <b>Знайдено:</b>
          <span style="margin-left: 5px">{{ findedItems.length }}</span>
        </div>
      </div>
    </template>
    <TreeVisualFlat
      :items="filteredData"
      :columns="columns"
      :useChecked="useChecked"
      :loading="loading || innerLoading"
      :multiSelect="multiSelect"
      @checked="changeChecked"
      @expanded="changeExpanded"
      @checkAll="val => changeAll('checked', val)"
      @expandedAll="val => changeAll('expanded', val)">
      <template v-if="treeText" #treeTextSlot>{{ treeText }}</template>
    </TreeVisualFlat>
    <TreeTag
      v-if="useTags"
      :items="checkedItems"
      :limit="10"
      :count="30"
      @delete-tag="val => changeChecked(val.id, false)"
      @click-tag="clickTag"/>
  </div>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash';
import type { RowObject } from "../../interfaces/RowObject";
import type { TreeProps } from "../../interfaces/props/TreeProps";

import TreeVisualFlat from './TreeVisualFlat.vue'
import TreeSearchInputFlat from './TreeSearchInputFlat.vue'

const name = 'Tree';

const treeSearchInput = ref<HTMLElement | null>(null);

const props = defineProps<TreeProps>();
const emit = defineEmits([
  'update:value',
  'click-tag',
  'delete-tag'
]);

const checkedItems = ref<RowObject[]>([])  // выбранные эллементы
const findedItems = ref<RowObject[]>([])

const innerLoading = ref(false) // признак загрузки/обработки данных
const flatData = ref<RowObject[]>([])
const filteredData = ref<RowObject[]>([]) // данные для отображения (с учетом строки поиска)

/**
 * Делаем дерево плоским
 */
const flattenTree = (data: RowObject[], level = 0, parentId = null) => {
  const result =  data.reduce((acc, item) => {
    const newItem = {
      ...item,
      level,
      parentId,
      childrens: item.children?.length || 0,
      state: {
        ...item.state,
        show: level === 0 ? true : (item.state.show ?? false),
        indeterminate: item.state.indeterminate ?? false,
      }
    };

    acc.push(newItem);
    if (item.children && item.children.length > 0) {
      acc = acc.concat(flattenTree(item.children, level + 1, item.id));
    }
    return acc;
  }, []);

  return result//.filter(i => filterItem(i))
};

const clickTag = (tag: RowObject) => {
  console.log(treeSearchInput, tag)
  /*if (treeSearchInput) {
    treeSearchInput = tag.columns.code.value
  }*/
}

const changeAll = (propName: string, state: boolean) => {
  const rootItems = flatData.value.filter(item => !item.parentId)

  if (propName === 'checked') {
    rootItems.forEach((item) => {
      changeChecked(item.id, state)
    })
  } else {
    changeProp(rootItems, 'show', state)
  }
}

const checkedIds = computed(() => {
  if (!checkedItems.value?.length) {
    return []
  }
  return checkedItems.value.map((i: RowObject) => i.id)
});


const prepareHighlightRegex = (text: string) => new RegExp(`(${text})`, 'gi');
const highlightMatch = (text: string, regex: RegExp): string => {
  return text.replace(regex, '<b>$1</b>');
};

const clearState = () => {
  findedItems.value = []
  changeProp(flatData.value, 'show', false)
  changeProp(flatData.value, 'finded', false)
  changeProp(flatData.value, 'expanded', false)
  flatData.value.filter(item => !item.parentId).map(i => i.state.show = true)
}

const startSearch = async (searchText: string) => {
  innerLoading.value = true
  flatData.value.map(i => i.state.finded = false)
  if (!searchText?.length) {
    clearState()
    filteredData.value = flatData.value
    innerLoading.value = false
  } else {
    //await changeProp(flatData.value, 'show', false)
    const searchRegex = prepareHighlightRegex(searchText);
    const checkContainsText = (node: RowObject, value: string)=> searchRegex.test(value);

    findedItems.value = flatData.value.filter(node => {
      let codeContainsText
      let titleContainsText
      try {
        codeContainsText = checkContainsText(node, node.columns?.code?.value);
        titleContainsText = checkContainsText(node, node.columns?.title?.value);
      } catch(e) {
      }
      if (codeContainsText) {
        node.columns.code.value = highlightMatch(node.columns.code.value, searchRegex);
      } else {
        node.columns.code.value = node.columns.code.value.replace(/<\/?b>/g, '');
      }
      if (titleContainsText) {
        node.columns.title.value = highlightMatch(node.columns.title.value, searchRegex);
      } else {
        node.columns.title.value = node.columns.title.value.replace(/<\/?b>/g, '');
      }
      if (codeContainsText || titleContainsText) {
        node.state.finded = true;
        return true;
      } else {
        node.state.finded = false;
        node.state.show = false;
        return false;
      }
    })

    if (findedItems.value?.length) {
      await changeProp(findedItems.value, 'finded', true)
      findedItems.value.forEach(async (findedItem) => {
        getParents(findedItem.id)
          .then(async (parrents) => {
            //console.log(parrents.map(i => i.id))
            await changeProp(parrents, 'show', true)
            await changeProp(parrents, 'expanded', true)
          })
      })
    }
    innerLoading.value = false
  }
}

const changeProp = async (items: RowObject[], propName: string, state: boolean) => {
  items.forEach((item) => (item.state as any)[propName] = state)
}

const changeExpanded = async (id: number, state: boolean) => {
  if (state) {
    flatData.value
      .find(item => item.id === id)
      .state.expanded = state
    const items = flatData.value.filter(item => item.parentId === id)
    changeProp(items, 'show', true)
  } else if (!state) {
    const ids = getChildIds([id])
    const items = flatData.value.filter(item => ids.includes(item.id))
    changeProp(items, 'expanded', false)
    changeProp(items.filter(item => item.id !== id), 'show', false)
  }
}

const changeChecked = async (id: number, state: boolean) => {
  const setProps = (ids: number[], state: boolean, useChildren: boolean) => {
    if (useChildren) {
      ids = getChildIds(ids)
    }
    flatData.value.filter(item => ids.includes(item.id))
      .forEach((item) => {
        item.state.checked = state
        if (props.openAfterSelect && state) {
          item.state.expanded = state
          item.state.show = state
          if (state) {
            const items = flatData.value.filter(childrenItem => childrenItem.parentId === item.id)
            changeProp(items, 'show', true)
          }
        }
      })

    return ids
  }
  if (state && !props.multiSelect && !props.parentToChild && checkedIds.value.some((i: number) => i !== id)) {
    setProps(checkedIds.value, false, false)
  }
  setProps([id], state, props.parentToChild && props.multiSelect)

  getAllChecked();
};

/**
 * получить ключи детей по родителю
 */
const getChildIds = (idParents: number[]): number[] => {
  const resultIds: number[] = [...idParents];
  let currentLevelIds = [...idParents];

  while (currentLevelIds.length > 0) {
    const childIds = flatData.value
      .filter(item => item.parentId !== undefined && currentLevelIds.includes(item.parentId))
      .map(item => item.id);

    if (childIds.length > 0) {
      resultIds.push(...childIds);
      currentLevelIds = childIds;
    } else {
      break;
    }
  }

  return resultIds;
};
const getParents = (childId: number): Promise<RowObject[]> => {
  return new Promise<RowObject[]>((resolve) => {
    const result: RowObject[] = [];
    let currentId: number | undefined = childId;

    while (currentId !== undefined) {
      const parent = flatData.value.find(item => item.id === currentId);

      if (parent !== undefined) {
        result.push(parent);
        currentId = parent?.parentId;
      } else {
        break;
      }
    }
    resolve(result);
  });
};
/**
 * Получить все отмеченные эллементы
 */
const getAllChecked = () => {
  checkedItems.value = flatData.value.filter(i => i.state.checked)
  emit('update:value', checkedItems.value)
}

/**
 * Установить значение в конкретный эллемент
 * id - ключ эллемента
 * propName - имя свойства в state
 */
const setNodeProps = (optionsProps: {
  dataItems: RowObject[];
  propName: string;
  id?: number;
  value?: any;
  parentToChild?: boolean;
 }) => {
  return new Promise<void>((resolve) => {
    const { dataItems, propName, id, value, parentToChild } = optionsProps;

    const item = dataItems.find(i => i.id=== id)

    if (item) {
      const newValue = value ?? !(item.state as any)[propName];
      (item.state as any)[propName] = newValue;
    }
    resolve();
  });
};

const treeText = computed(() => {
  if (flatData.value?.length && !filteredData.value?.some(i => i.state.show)) {
    return 'На жаль, за вашим запитом нічого не знайдено.'
  } else if (props.loading || innerLoading.value) {
    return 'Завантаження...'
  } else if (!flatData.value?.length) {
    return 'Даних немає'
  }
  return null
});

watch(() => props.items, (newValue) => {
  filteredData.value = flatData.value = flattenTree(cloneDeep(props.items))
}, {immediate: true})
</script>
