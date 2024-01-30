<script lang="ts" setup>
import { computed } from 'vue'
import TaErrorMessage from './TaErrorMessage.vue'
import TaInputWrapper, { type TaInputWrapperProps } from './TaInputWrapper.vue'

export type TaSelectProps = Omit<TaInputWrapperProps, 'modelModifiers'> & {
  options: unknown[]
  allowPlaceholder?: boolean
  getName?: (option: unknown) => string
  getValue?: (option: unknown) => string | number | undefined
}

const props = defineProps<TaSelectProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown): void
}>()

const value = computed({
  get: () => (props.getValue ? props.getValue(props.modelValue) : props.modelValue),
  set: v => {
    if (!props.getValue) return emit('update:modelValue', v)

    const option = props.options.find(o => props.getValue?.(o) === v)

    emit('update:modelValue', option)
  },
})

const getName = props.getName ?? (o => (o as { name: string })?.name)

const getValue =
  props.getValue ?? (o => (o as { value: string })?.value ?? (o as { id: string })?.id)

const innerOptions = computed(() =>
  props.options.map(o => ({
    name: getName(o),
    value: getValue(o),
  }))
)
</script>

<template>
  <TaInputWrapper
    :label="label"
    :model-value="undefined"
    :error="error"
    :size="size"
    :vertical="vertical"
    :icon="icon"
    :reverse="reverse"
  >
    <template #default="{ inputClasses }">
      <div class="input-wrapper">
        <select v-model="value" v-bind="$attrs" :class="inputClasses">
          <option :disabled="!allowPlaceholder" value="">{{ $attrs['placeholder'] }}</option>
          <option v-for="(opt, i) of innerOptions" :key="i" :value="opt.value">
            {{ opt.name }}
          </option>
        </select>
        <TaErrorMessage v-if="error" :error="error" />
      </div>
    </template>
  </TaInputWrapper>
</template>
