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
import { cloneDeep, debounce } from 'lodash';
import type { RowObject } from "../../interfaces/RowObject";
import type { TreeProps } from "../../interfaces/props/TreeProps";

import TreeVisualFlat from './TreeVisualFlat.vue'
import TreeSearchInputFlat from './TreeSearchInputFlat.vue'

const name = 'Tree';

const treeSearchInput = ref<{ findText: string } | null>(null);

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

  return result
};

/**
 * Клик по тегу. Делаем поиск по коду, что б увидеть эллемент
 */
const clickTag = (tag: RowObject) => {
  if (treeSearchInput) {
    treeSearchInput.value.findText = tag.columns.code.value
  }
}
/**
 * Действие из шапки дерева
 */
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

const prepareHighlightRegex = (text: string) => new RegExp(`(${text})`, 'gi');
const highlightMatch = (text: string, regex: RegExp): string => {
  text = text.replace(/<\/?b>/g, '')
  return text.replace(regex, '<b>$1</b>');
};

/**
 * сброс состояния поиска и сворачивание всего дерева
 */
const clearState = () => {
  findedItems.value = []
  changeProp(flatData.value, 'show', false)
  changeProp(flatData.value, 'finded', false)
  changeProp(flatData.value, 'expanded', false)
  flatData.value.filter(item => !item.parentId).map(i => i.state.show = true)
}
/**
 * ищем ветки дерева и заполняем массив findedItems
 */
const startSearch = async (searchText: string) => {
  innerLoading.value = true
  flatData.value.map(i => i.state.finded = false)
  if (!searchText?.length) {
    clearState()
    filteredData.value = flatData.value
    innerLoading.value = false
  } else {
    const searchRegex = prepareHighlightRegex(searchText);
    const checkContainsText = (value: string)=> {
      value = value.replace(/<\/?b>/g, '')
      return searchRegex.test(value);
    }

    findedItems.value = flatData.value.filter(node => {
      let codeContainsText
      let titleContainsText
      try {
        codeContainsText = checkContainsText(node.columns?.code?.value);
        titleContainsText = checkContainsText(node.columns?.title?.value);
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
      changeProp(findedItems.value, 'finded', true)
      findedItems.value.forEach(async (findedItem) => {
        getParents([ findedItem.id ])
          .then(async (parrents) => {
            changeProp(parrents, 'show', true)
            changeProp(parrents, 'expanded', true)
          })
      })
    }
    innerLoading.value = false
  }
}

const changeProp = (items: RowObject[], propName: string, state: boolean) => {
  items.forEach((item) => (item.state as any)[propName] = state)
}

const changeExpanded = async (id: number, state: boolean) => {
  if (!flatData.value.length) {
    return
  }
  if (state) {
    const currentItem = flatData.value
      .find(item => item.id === id)
    if (currentItem) {
      currentItem.state.expanded = state
    }
    const items = flatData.value.filter(item => item.parentId === id)
    changeProp(items, 'show', true)
  } else if (!state) {
    const childrens = await getChilds([id])
    const ids = [id, ...childrens.map((item: RowObject) => item.id)]
    const items = flatData.value.filter(item => ids.includes(item.id))
    changeProp(items, 'expanded', false)
    changeProp(items.filter(item => item.id !== id), 'show', false)
  }
}

const changeChecked = async (id: number, state: boolean) => {
  const setProps = async (ids: number[], state: boolean, useChildren: boolean) => {
    if (useChildren) {
      const childrens = await getChilds(ids)
      ids = [...ids, ...childrens.map((item: RowObject) => item.id)]
    }
    flatData.value.filter(item => ids.includes(item.id))
      .forEach(async (item) => {
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
  if (state && !multiSelect.value && !props.parentToChild && checkedIds.value.some((i: number) => i !== id)) {
    await setProps(checkedIds.value, false, false)
  }

  await setProps([id], state, props.parentToChild && multiSelect.value)
  await getAllChecked();
};
/**
 * получить ключи детей по родителю
 */
const getChilds = (parentsIds: number[]): Promise<RowObject[]> => {
  return new Promise<RowObject[]>((resolve) => {
    const result: RowObject[] = [];
    let currentLevelIds = [...parentsIds];

    while (currentLevelIds.length > 0) {
      const childs = flatData.value
        .filter(item => item.parentId !== undefined && currentLevelIds.includes(item.parentId))

      if (childs.length > 0) {
        result.push(...childs);
        currentLevelIds = childs.map(item => item.id);
      } else {
        break;
      }
    }

    resolve(result);
  });
};
/**
 * Получить всех родителей
 */
const getParents = (childIds: number[]): Promise<RowObject[]> => {
  return new Promise<RowObject[]>((resolve) => {
    let result: RowObject[] = [];
    let currentIds: (number | undefined)[] = childIds;

    while (currentIds?.length) {
      const parents = flatData.value.filter(item => currentIds?.includes(item.id));

      if (parents?.length) {
        result = [...result, ...parents];
        currentIds = parents.map(item => item.parentId);
      } else {
        break;
      }
    }

    const filteredResult = result.filter(item => !childIds.includes(item.id));

    const uniqueData: RowObject[] = Object.values(
      filteredResult.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<number, RowObject>)
    );

    resolve(uniqueData);
  });
};
const setIndeterminate = async (ids: number[]) => {
  flatData.value.map(i => i.state.indeterminate = false)

  const parrents = await getParents(ids)

  parrents
    .filter(i => !i.state.checked)
    .map(i => i.state.indeterminate = true)
}
/**
 * Получить все отмеченные эллементы
 */
const getAllChecked = debounce(async () => {
  checkedItems.value = flatData.value.filter(i => i.state.checked)
  emit('update:value', checkedItems.value)

  await setIndeterminate(checkedIds.value)
}, 300);
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
/**
 * Ключи всех выбранных эллементов
 */
const checkedIds = computed(() => {
  if (!checkedItems.value?.length) {
    return []
  }
  return checkedItems.value.map((i: RowObject) => i.id)
});
/**
 * Можно ли выбирать несколько эллементов
 */
const multiSelect = computed(() => {
  return props.multiSelect || props.parentToChild
});
/**
 * Сравниваем два массива и получаем значения что отличаются
 */
const findDifferences = (arr1: number[], arr2: number[]): number[] => {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  const onlyInArr1 = arr1.filter(num => !set2.has(num));
  const onlyInArr2 = arr2.filter(num => !set1.has(num));

  return [...onlyInArr1, ...onlyInArr2 ];
};

/**
 * Следим за набором данных (в виде дерева)
 * получаем плоское дерево и проставляем признаки для изначально выбранных эллементов
 */
watch(() => props.items, (newValue) => {
  if (!props.items?.length) {
    return
  }
  const result = flattenTree(cloneDeep(props.items))
  if (props.value?.length) {
    const ids = props.value.map(i => i.id)
    result
      .filter(item => ids.includes(item.id))
      .forEach((item) => {
        item.state.checked = true
      })
  }
  filteredData.value = flatData.value = result
  getAllChecked();
}, {immediate: true})
</script>
