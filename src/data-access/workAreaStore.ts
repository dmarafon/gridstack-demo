import type { GridStack } from 'gridstack'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useWorkspaceApi, type Workspace, type WorkspaceWidget } from '../api/useWorkAreaApi'

const STORE_ID = 'mt_workarea'

export const useWorkspaceStore = defineStore(STORE_ID, () => {
  let loadingStore = ref(false)

  const api = useWorkspaceApi()

  const data = ref<Workspace[]>([])

  const selectedWorkspace = ref<string>()

  const currentWorkspace = ref<Workspace | undefined>()

  const newWidgetsIds = ref<string[]>([])

  const grid = ref<GridStack | null>(null)

  watch(loadingStore, async () => {
    if (!loadingStore.value) return

    const list = await api.getWorkspaceList()

    if (!list) {
      loadingStore.value = false
      return
    }

    data.value = list

    selectedWorkspace.value = data.value.find(d => d.id === 'default')?.id

    loadingStore.value = false
  })

  loadingStore.value = true

  const canEdit = ref(false)

  const refreshKey = ref(0)

  const toggleCanEdit = () => (canEdit.value = !canEdit.value)

  const resetStore = () => {
    selectedWorkspace.value = ''

    loadingStore.value = true

    selectedWorkspace.value = currentWorkspace.value?.id

    canEdit.value = false

    refreshComponent()
  }

  const updateSelectedWorkspace = (id: string) => {
    selectedWorkspace.value = id
  }
  const saveWorkspace = async () => {
    const workspaces = JSON.parse(JSON.stringify(data.value)) as Workspace[]

    if (!workspaces.length) return

    const workspace = workspaces.find(w => w.id === selectedWorkspace.value)

    if (!workspace) return

    const items = grid.value?.getGridItems()

    const newWidgetsMapped: WorkspaceWidget[] =
      currentWorkspace.value?.widgets?.map(w => ({
        id: w.id,
        type: w.type,
        data: w.data,
        position: {
          y: items?.find(i => i.gridstackNode?.id === w.id)?.gridstackNode?.y ?? w.position?.y,
          x: items?.find(i => i.gridstackNode?.id === w.id)?.gridstackNode?.x ?? w.position?.x,
        },
        size: {
          h: items?.find(i => i.gridstackNode?.id === w.id)?.gridstackNode?.h ?? w.size?.h,
          w: items?.find(i => i.gridstackNode?.id === w.id)?.gridstackNode?.w ?? w.size?.w,
        },
      })) ?? []

    workspace.widgets = newWidgetsMapped

    const { res } = await api.saveWorkspace(workspaces)

    if (res) {
      const currentId = JSON.parse(JSON.stringify(selectedWorkspace.value))

      data.value = []

      selectedWorkspace.value = ''

      currentWorkspace.value = undefined

      grid.value?.removeAll(true)

      data.value = await api.getWorkspaceList()

      selectedWorkspace.value = currentId

      toggleCanEdit()
    }
  }

  const updateWidget = (data: WorkspaceWidget['data'], widgetId: string) => {
    const widget = currentWorkspace.value?.widgets?.find(w => w.id === widgetId)

    if (widget) widget.data = data
  }

  const deleteWidget = (id: string) => {
    const items = grid.value?.getGridItems()

    const element = items?.find(i => i.gridstackNode?.id === id)

    console.log(element)
    if (element) grid.value?.removeWidget(element)
  }

  const deleteAllNewWidgets = () => newWidgetsIds.value.forEach(id => deleteWidget(id))

  const restoreCurrentWorkspace = async () => {
    const items = grid.value?.getGridItems()

    if (items) {
      for (const item of items) {
        if (!item.gridstackNode?.id) grid.value?.removeWidget(item)
      }
    }

    const getList = await api.getWorkspaceList()

    currentWorkspace.value = getList.find(w => w.id === currentWorkspace.value?.id)
  }

  const refreshComponent = () => (refreshKey.value += 1)

  watch(selectedWorkspace, async newSelectedWorkspace => {
    deleteAllNewWidgets()
    const workspace = data.value.find(w => w.id === newSelectedWorkspace)

    if (workspace) {
      currentWorkspace.value = JSON.parse(JSON.stringify(workspace)) as Workspace

      refreshComponent()
    }
  })

  return {
    workspaces: data,
    selectedWorkspace,
    currentWorkspace,
    canEdit,
    refreshKey,
    newWidgetsIds,
    grid,
    deleteAllNewWidgets,
    deleteWidget,
    updateSelectedWorkspace,
    updateWidget,
    restoreCurrentWorkspace,
    toggleCanEdit,
    saveWorkspace,
    refreshComponent,
    // Used by pinia plugins
    $reset: resetStore,
    $patch: () => {},
  }
})
