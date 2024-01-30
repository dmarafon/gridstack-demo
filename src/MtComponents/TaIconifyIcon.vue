<script lang="ts" setup>
import { computed } from 'vue'
import TaIcon from './TaIcon.vue'

const prop = defineProps<{
  icon: string
}>()

const iconInfo = computed(() => {
  const [type = '', shortName = ''] = prop.icon.split(':')
  return {
    type: type,
    name: `${type}-${shortName}`,
    className: shortName,
  }
})
</script>

<template>
  <TaIcon v-if="iconInfo.type === 'iris'" :class="`icon-${iconInfo.className}`" />
</template>
