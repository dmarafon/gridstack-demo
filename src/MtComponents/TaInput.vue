<script lang="ts" setup>
import TaErrorMessage from './TaErrorMessage.vue'
import type { TaInputWrapperProps } from './TaInputWrapper.vue'
import TaInputWrapper from './TaInputWrapper.vue'

defineProps<TaInputWrapperProps>()

defineEmits<{ (e: 'update:modelValue', value: unknown): void }>()
</script>

<template>
  <TaInputWrapper v-bind="$props" @update:model-value="$emit('update:modelValue', $event)">
    <template #default="{ inputClasses, onInput }">
      <div class="input-wrapper">
        <input
          v-bind="$attrs"
          :value="modelValue"
          :model-modifiers="modelModifiers"
          :class="inputClasses"
          @input="onInput"
        />
        <TaErrorMessage v-if="error" :error="error" />
      </div>
    </template>
  </TaInputWrapper>
</template>
