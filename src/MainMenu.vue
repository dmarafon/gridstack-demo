<script setup lang="ts">
import TaSelect from './MtComponents/TaSelect.vue'
import { useWorkspaceStore } from './data-access/workAreaStore'

// It will be important that in the menu that we select , it has access to the store so it can
// the workspace changes
const store = useWorkspaceStore()
</script>

<template>
  <TaSelect
    :model-value="store.selectedWorkspace"
    :options="store.workspaces"
    @update:model-value="store.updateSelectedWorkspace"
  />
</template>
