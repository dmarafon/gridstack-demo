<script setup lang="ts">
import type { GridStackElement } from 'gridstack'
import { computed, ref, type Ref } from 'vue'
import type { Widget, WorkspaceWidget } from '../api/useWorkAreaApi'
import { getWidgetComponent } from './widgetContent/loader'

defineProps<{
  id: string
  type: Widget
  data: WorkspaceWidget['data']
  canEdit: Ref<boolean>
}>()

const emit = defineEmits<{
  (e: 'remove', id: GridStackElement): void
  (e: 'update:modelValue', value: WorkspaceWidget['data']): void
}>()

const gridItem = ref<null | string>(null)

const handleRemove = () => {
  if (!gridItem.value) return

  emit('remove', gridItem.value)
}
</script>

<template>
  <div ref="gridItem" class="grid-stack-item my-custom-grid-item-component">
    <div class="grid-stack-item-content">
      <button v-if="canEdit.value" @click="handleRemove">X</button>
      <Component
        :is="getWidgetComponent(type)"
        v-bind="{ ...data, canEdit: computed(() => canEdit.value) }"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>
