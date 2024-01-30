<script lang="ts" setup>
defineProps<{ error: string }>()
</script>

<template>
  <div class="input-error-msg-wrapper">
    <div class="input-error-msg">
      <div class="msg-tooltip"><div class="tooltip-triangle" /></div>
      <div class="msg-text">{{ error }}</div>
    </div>
  </div>
</template>
