<script lang="ts" setup>
import type { Ref } from 'vue'
import TaInput from '../../MtComponents/TaInput.vue'
import type { WidgetTextData } from '../../api/useWorkAreaApi'

const props = defineProps<WidgetTextData & { canEdit: Ref<boolean> }>()

const emits = defineEmits<{ (e: 'update:modelValue', value: WidgetTextData): void }>()

const updateData = (value: unknown, type: 'text') => {
  const data = { text: type === 'text' ? (value as string) : props.text }

  emits('update:modelValue', data)
}
</script>

<template>
  <p>{{ `Hello, Im a TEXT Widget` }}</p>
  <TaInput
    v-if="canEdit.value"
    :model-value="text"
    @update:model-value="updateData($event, 'text')"
  />
  <p v-else>{{ text }}</p>
</template>
