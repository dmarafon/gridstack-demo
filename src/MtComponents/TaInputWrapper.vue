<script lang="ts" setup>
import { computed, useAttrs } from 'vue'
import TaIconifyIcon from './TaIconifyIcon.vue'

export type TaInputWrapperProps = {
  modelValue: unknown
  modelModifiers?: Record<string, boolean>
  label?: string
  error?: string | undefined
  icon?: string | null
  /**
   * @default 'normal'
   */
  size?: 'normal' | 'small' | 'xsmall'
  vertical?: boolean
  reverse?: boolean
}

const props = defineProps<TaInputWrapperProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()

defineOptions({ inheritAttrs: false })

const wrapperClasses = computed(() => ({
  'vertical-label': !!props.vertical,
  'input-error': !!props.error,
  'is-icon': !!props.icon,
  'input-reverse': !!props.reverse,
}))

const labelClasses = computed(() => ({
  'label-small': props.size === 'small',
  'label-xsmall': props.size === 'xsmall',
}))

const inputClasses = computed(() => ({
  'input-small': props.size === 'small',
  'input-xsmall': props.size === 'xsmall',
  input: true,
}))

const attrs = useAttrs()

const onInput = (event: Event) => {
  let value: string | number = (event.target as HTMLInputElement).value

  if (attrs['type'] === 'number' && value) {
    // Mimicking vue .number model modifier. If it's unparseable an empty string will be emitted.
    value = parseFloat(value)
  }

  emit('update:modelValue', value)
}
</script>

<template>
  <div class="input-wrapper" :class="wrapperClasses">
    <label v-if="label" :for="($attrs['id'] as string)" class="label" :class="labelClasses">
      <TaIconifyIcon v-if="icon" :icon="icon" class="mr-[8px]" />
      {{ label }}
    </label>
    <slot v-bind="{ onInput, inputClasses }" />
  </div>
</template>

<style lang="css">
.is-icon input[type='checkbox'] {
  @apply h-5 w-5;
}
.is-icon label {
  @apply !flex;
}
</style>
