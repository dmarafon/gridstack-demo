<script lang="ts" setup>
import { onMounted, ref, type Ref } from 'vue'
import type { FakeListType } from '../../api/useFakeListApi'
import type { TestListType } from '../../api/useTestListApi'
import type { WidgetListData } from '../../api/useWorkAreaApi'
import { loadList } from './loadLists'

const props = defineProps<WidgetListData & { canEdit: Ref<boolean> }>()

const entitityData = ref<TestListType | FakeListType>()

onMounted(async () => {
  const list = await loadList(props.entityName)

  entitityData.value = list
})
</script>

<template>
  <p>{{ `Hello, Im a List Widget Called with ${entityName}` }}</p>
  <div>{{ entitityData?.totalItems }}</div>
  <div v-for="item in entitityData?.items">
    <div>{{ item.name }}</div>
    <div>{{ (item as TestListType['items'][0]).extra }}</div>
  </div>
</template>
