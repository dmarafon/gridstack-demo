<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import {
  GridStack,
  type GridItemHTMLElement,
  type GridStackElement,
  type GridStackWidget,
} from 'gridstack'
import { computed, h, render, watch } from 'vue'
import type { Widget, WidgetListData, WidgetTextData, WorkspaceWidget } from '../api/useWorkAreaApi'
import { useWorkspaceStore } from '../data-access/workAreaStore'
import { createUUID } from '../utils/createUUID'
import WidgetContainer from './WidgetContainer.vue'

const store = useWorkspaceStore()

const currentGridStackWidget = computed(() =>
  store.currentWorkspace?.widgets ? store.currentWorkspace.widgets.map(getGridStackWidgetData) : []
)

const getGridStackWidgetData = (workspaceWidget: WorkspaceWidget): GridStackWidget => ({
  x: workspaceWidget.position?.x,
  y: workspaceWidget.position?.y,
  h: workspaceWidget.size?.h,
  w: workspaceWidget.size?.w,
  maxH: workspaceWidget.size?.maxH,
  maxW: workspaceWidget.size?.maxW,
  id: workspaceWidget.id,
})

const getWidgetData = (
  widgetId: string
): { data: WorkspaceWidget['data']; type: WorkspaceWidget['type'] } | undefined => {
  const widget = store.currentWorkspace?.widgets?.find(w => w.id === widgetId)

  if (!widget) return

  return {
    type: widget.type,
    data: widget.data,
  }
}

const { height } = useWindowSize()

const test1 = computed(() => `${height}px`)

// DO NOT use ref(null) as proxies GS will break all logic when comparing structures.
// see https://github.com/gridstack/gridstack.js/issues/2115
let grid: GridStack | null = null

watch(
  () => store.currentWorkspace,
  newValue => {
    if (grid !== null) {
      deleteAllNewWidgets()

      store.newWidgetsIds = []
    }

    if (store.currentWorkspace?.widgets) store.currentWorkspace.widgets = newValue?.widgets ?? []

    grid = GridStack.init({
      // DO NOT use grid.value = GridStack.init(), see above
      float: true,
      // Min Row as 1 to trigger right overflow
      // Width Max value is 4800px and grid height square is 160px (145px of height + 15px of margin).
      // Tho reach that value we need 30 columns (4800 / 160 = 30).
      column: 30,
      cellHeight: '145px',
      margin: '15px',
    })

    grid.load(currentGridStackWidget.value, gsAddRemoveVueComponents)

    store.grid = grid

    if (!store.canEdit) grid?.disable()
  }
)

const deleteAllNewWidgets = () =>
  store.newWidgetsIds.forEach(id => {
    const widget = store.currentWorkspace?.widgets?.find(w => w.id === id)

    if (widget && widget.element) grid?.removeWidget(widget.element)
  })

const createElementNode = (widgetId: string, type: Widget, data: WorkspaceWidget['data']) => {
  const itemVNode = h(WidgetContainer, {
    id: widgetId,
    type,
    data,
    canEdit: computed(() => store.canEdit),
    onRemove: (itemEl: GridStackElement) => {
      if (grid === null) return

      if (store.currentWorkspace?.widgets) {
        store.currentWorkspace.widgets = store.currentWorkspace.widgets.filter(
          w => w.id !== widgetId
        )
      }

      grid.removeWidget(itemEl)
      store.deleteWidget(widgetId)
    },
    'onUpdate:modelValue': (value: WorkspaceWidget['data']) => store.updateWidget(value, widgetId),
  })

  shadowDom[widgetId] = document.createElement('div')
  console.log(shadowDom[widgetId])
  render(itemVNode, shadowDom[widgetId])

  if (itemVNode.el === null) return

  return itemVNode.el as GridItemHTMLElement
}

const shadowDom: Record<string, HTMLDivElement> = {}

const gsAddRemoveVueComponents = (
  host: GridItemHTMLElement | undefined,
  widget: GridStackWidget,
  add: boolean | undefined
): GridItemHTMLElement | undefined => {
  if (!host) return

  if (!widget.id) return

  if (add) {
    const widgetDataAndType = getWidgetData(widget.id)

    if (!widgetDataAndType) return

    const elementNode = createElementNode(widget.id, widgetDataAndType.type, widgetDataAndType.data)

    if (!elementNode) return

    const workspaceWidget = store.currentWorkspace?.widgets?.find(w => w.id === widget.id)

    if (workspaceWidget) workspaceWidget.element = elementNode

    return elementNode
  }
}

watch(
  () => store.canEdit,
  () => {
    if (!grid) return

    if (!store.canEdit) {
      grid.disable()

      return
    }

    grid.enable()
  }
)

const addNewWidget = (type: Widget, listType?: 'Fake' | 'Test') => {
  if (grid === null) return

  const widgetId = createUUID()

  let data: WidgetListData | WidgetTextData =
    type === 'list' && listType
      ? {
          entityName: listType,
        }
      : { text: 'GIVE YOUR TEXT' }

  const elementNode: GridItemHTMLElement | undefined = createElementNode(widgetId, type, data)
  console.log(elementNode)
  if (!elementNode) return

  const defineDimensions =
    type === 'list' ? { w: 4, h: 3, autoPosition: true } : { w: 3, h: 2, autoPosition: true }

  grid.addWidget(elementNode, defineDimensions)

  const newWidget = {
    id: widgetId,
    element: elementNode,
    data,
    type,
    position: { x: elementNode.gridstackNode?.x, y: elementNode.gridstackNode?.y },
    size: { h: elementNode.gridstackNode?.h, w: elementNode.gridstackNode?.w },
  }

  // This should be an addWidget Function
  if (store.currentWorkspace?.widgets) {
    store.currentWorkspace?.widgets.push(newWidget)

    store.newWidgetsIds.push(widgetId)
  }

  // Before exiting, we should add to the currentWidgets the new widget so that we can save it later.
}

const exitAndRestore = () => {
  if (store.canEdit && !!grid) {
    store.restoreCurrentWorkspace()

    if (store.currentWorkspace?.widgets) {
      for (const [idx, widget] of store.currentWorkspace.widgets.entries()) {
        const elementNode = createElementNode(widget.id, widget.type, widget.data)

        store.currentWorkspace.widgets[idx].element = elementNode
      }
    }
  }

  store.toggleCanEdit()
}

const exitAndSave = () => {
  if (store.canEdit && grid) {
    store.saveWorkspace()

    store.toggleCanEdit()
  }

  store.toggleCanEdit()
}

const test2 = computed<string>(() => {
  if (!store.currentWorkspace?.widgets) return ''

  const allXWithId = store.currentWorkspace?.widgets.map(w => {
    if (!w.position?.x || !w.size?.w) return { size: 0, x: w.position?.x ?? 0, id: w.id }

    return {
      size: w.position?.x + (w.size?.w - 1),
      x: w.position.x,
      id: w.id,
    }
  })

  const bigX = allXWithId.reduce((prev, current) => {
    return prev.x > current.x ? prev : current
  })

  const bigXWidthSize = store.currentWorkspace?.widgets.find(w => w.id === bigX.id)?.size?.w

  const lastFinalPosition = (bigX.x + 1) * 160

  let finalValue = '0px'
  console.log(bigXWidthSize)
  if (bigXWidthSize === 1 || !bigXWidthSize) finalValue = `${lastFinalPosition}px`

  if (bigXWidthSize && bigXWidthSize > 1)
    finalValue = `${lastFinalPosition + (bigXWidthSize - 1) * 160}px`

  return finalValue
})
</script>

<template>
  <div
    :style="{
      width: !store.canEdit ? test2 : '4800px',
      overflowX: !store.canEdit ? 'hidden' : 'auto',
      overflowY: !store.canEdit ? 'auto' : 'auto',
    }"
  >
    <button type="button" @click="exitAndRestore()">
      {{ store.canEdit ? 'EXIT EDIT DASHBOARD' : 'EDIT DASHBOARD' }}
    </button>
    <button v-if="store.canEdit" type="button" @click="exitAndSave">
      {{ 'SAVE DASHBOARD' }}
    </button>
    <button v-if="store.canEdit" type="button" @click="addNewWidget('text')">
      Add TEXT Widget
    </button>
    <button v-if="store.canEdit" type="button" @click="addNewWidget('list', 'Fake')">
      Add LIST FAKE Widget
    </button>
    <button v-if="store.canEdit" type="button" @click="addNewWidget('list', 'Test')">
      Add LIST TEST Widget
    </button>
    <div
      v-if="store.workspaces"
      class="grid-stack"
      :style="{ minWidth: '4800px', minHeight: test1 }"
    ></div>
  </div>
</template>

<style>
@import '../../node_modules/gridstack/dist/gridstack.css';

.test {
  max-height: 300px;
}
/* Optional styles for demos */
.btn-primary {
  color: #fff;
  background-color: #007bff;
}

.btn {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  border-radius: 0.25rem;
}

a {
  text-decoration: none;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.grid-stack {
  background: #fafad2;
}

.grid-stack-item-content {
  text-align: center;
  background-color: #18bc9c;
}

.grid-stack-item-removing {
  opacity: 0.5;
}
.trash {
  height: 100px;
  background: rgba(255, 0, 0, 0.1) center center
    url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDQzOC41MjkgNDM4LjUyOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjUyOSA0MzguNTI5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQxNy42ODksNzUuNjU0Yy0xLjcxMS0xLjcwOS0zLjkwMS0yLjU2OC02LjU2My0yLjU2OGgtODguMjI0TDMwMi45MTcsMjUuNDFjLTIuODU0LTcuMDQ0LTcuOTk0LTEzLjA0LTE1LjQxMy0xNy45ODkgICAgQzI4MC4wNzgsMi40NzMsMjcyLjU1NiwwLDI2NC45NDUsMGgtOTEuMzYzYy03LjYxMSwwLTE1LjEzMSwyLjQ3My0yMi41NTQsNy40MjFjLTcuNDI0LDQuOTQ5LTEyLjU2MywxMC45NDQtMTUuNDE5LDE3Ljk4OSAgICBsLTE5Ljk4NSw0Ny42NzZoLTg4LjIyYy0yLjY2NywwLTQuODUzLDAuODU5LTYuNTY3LDIuNTY4Yy0xLjcwOSwxLjcxMy0yLjU2OCwzLjkwMy0yLjU2OCw2LjU2N3YxOC4yNzQgICAgYzAsMi42NjQsMC44NTUsNC44NTQsMi41NjgsNi41NjRjMS43MTQsMS43MTIsMy45MDQsMi41NjgsNi41NjcsMi41NjhoMjcuNDA2djI3MS44YzAsMTUuODAzLDQuNDczLDI5LjI2NiwxMy40MTgsNDAuMzk4ICAgIGM4Ljk0NywxMS4xMzksMTkuNzAxLDE2LjcwMywzMi4yNjQsMTYuNzAzaDIzNy41NDJjMTIuNTY2LDAsMjMuMzE5LTUuNzU2LDMyLjI2NS0xNy4yNjhjOC45NDUtMTEuNTIsMTMuNDE1LTI1LjE3NCwxMy40MTUtNDAuOTcxICAgIFYxMDkuNjI3aDI3LjQxMWMyLjY2MiwwLDQuODUzLTAuODU2LDYuNTYzLTIuNTY4YzEuNzA4LTEuNzA5LDIuNTctMy45LDIuNTctNi41NjRWODIuMjIxICAgIEM0MjAuMjYsNzkuNTU3LDQxOS4zOTcsNzcuMzY3LDQxNy42ODksNzUuNjU0eiBNMTY5LjMwMSwzOS42NzhjMS4zMzEtMS43MTIsMi45NS0yLjc2Miw0Ljg1My0zLjE0aDkwLjUwNCAgICBjMS45MDMsMC4zODEsMy41MjUsMS40Myw0Ljg1NCwzLjE0bDEzLjcwOSwzMy40MDRIMTU1LjMxMUwxNjkuMzAxLDM5LjY3OHogTTM0Ny4xNzMsMzgwLjI5MWMwLDQuMTg2LTAuNjY0LDguMDQyLTEuOTk5LDExLjU2MSAgICBjLTEuMzM0LDMuNTE4LTIuNzE3LDYuMDg4LTQuMTQxLDcuNzA2Yy0xLjQzMSwxLjYyMi0yLjQyMywyLjQyNy0yLjk5OCwyLjQyN0gxMDAuNDkzYy0wLjU3MSwwLTEuNTY1LTAuODA1LTIuOTk2LTIuNDI3ICAgIGMtMS40MjktMS42MTgtMi44MS00LjE4OC00LjE0My03LjcwNmMtMS4zMzEtMy41MTktMS45OTctNy4zNzktMS45OTctMTEuNTYxVjEwOS42MjdoMjU1LjgxNVYzODAuMjkxeiIgZmlsbD0iI2ZmOWNhZSIvPgoJCTxwYXRoIGQ9Ik0xMzcuMDQsMzQ3LjE3MmgxOC4yNzFjMi42NjcsMCw0Ljg1OC0wLjg1NSw2LjU2Ny0yLjU2N2MxLjcwOS0xLjcxOCwyLjU2OC0zLjkwMSwyLjU2OC02LjU3VjE3My41ODEgICAgYzAtMi42NjMtMC44NTktNC44NTMtMi41NjgtNi41NjdjLTEuNzE0LTEuNzA5LTMuODk5LTIuNTY1LTYuNTY3LTIuNTY1SDEzNy4wNGMtMi42NjcsMC00Ljg1NCwwLjg1NS02LjU2NywyLjU2NSAgICBjLTEuNzExLDEuNzE0LTIuNTY4LDMuOTA0LTIuNTY4LDYuNTY3djE2NC40NTRjMCwyLjY2OSwwLjg1NCw0Ljg1MywyLjU2OCw2LjU3QzEzMi4xODYsMzQ2LjMxNiwxMzQuMzczLDM0Ny4xNzIsMTM3LjA0LDM0Ny4xNzJ6IiBmaWxsPSIjZmY5Y2FlIi8+CgkJPHBhdGggZD0iTTIxMC4xMjksMzQ3LjE3MmgxOC4yNzFjMi42NjYsMCw0Ljg1Ni0wLjg1NSw2LjU2NC0yLjU2N2MxLjcxOC0xLjcxOCwyLjU2OS0zLjkwMSwyLjU2OS02LjU3VjE3My41ODEgICAgYzAtMi42NjMtMC44NTItNC44NTMtMi41NjktNi41NjdjLTEuNzA4LTEuNzA5LTMuODk4LTIuNTY1LTYuNTY0LTIuNTY1aC0xOC4yNzFjLTIuNjY0LDAtNC44NTQsMC44NTUtNi41NjcsMi41NjUgICAgYy0xLjcxNCwxLjcxNC0yLjU2OCwzLjkwNC0yLjU2OCw2LjU2N3YxNjQuNDU0YzAsMi42NjksMC44NTQsNC44NTMsMi41NjgsNi41N0MyMDUuMjc0LDM0Ni4zMTYsMjA3LjQ2NSwzNDcuMTcyLDIxMC4xMjksMzQ3LjE3MnogICAgIiBmaWxsPSIjZmY5Y2FlIi8+CgkJPHBhdGggZD0iTTI4My4yMiwzNDcuMTcyaDE4LjI2OGMyLjY2OSwwLDQuODU5LTAuODU1LDYuNTctMi41NjdjMS43MTEtMS43MTgsMi41NjItMy45MDEsMi41NjItNi41N1YxNzMuNTgxICAgIGMwLTIuNjYzLTAuODUyLTQuODUzLTIuNTYyLTYuNTY3Yy0xLjcxMS0xLjcwOS0zLjkwMS0yLjU2NS02LjU3LTIuNTY1SDI4My4yMmMtMi42NywwLTQuODUzLDAuODU1LTYuNTcxLDIuNTY1ICAgIGMtMS43MTEsMS43MTQtMi41NjYsMy45MDQtMi41NjYsNi41Njd2MTY0LjQ1NGMwLDIuNjY5LDAuODU1LDQuODUzLDIuNTY2LDYuNTdDMjc4LjM2NywzNDYuMzE2LDI4MC41NSwzNDcuMTcyLDI4My4yMiwzNDcuMTcyeiIgZmlsbD0iI2ZmOWNhZSIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=)
    no-repeat;
}
.sidebar {
  background: rgba(0, 255, 0, 0.1);
  padding: 25px 0;
  height: 100px;
  text-align: center;
}
.sidebar .grid-stack-item {
  width: 120px;
  height: 50px;
  border: 2px dashed green;
  text-align: center;
  line-height: 35px;
  background: rgba(0, 255, 0, 0.1);
  cursor: default;
  display: inline-block;
}
.sidebar .grid-stack-item .grid-stack-item-content {
  background: none;
}

/* make nested grid have slightly darker bg take almost all space (need some to tell them apart) so items inside can have similar to external size+margin */
.grid-stack > .grid-stack-item.grid-stack-sub-grid > .grid-stack-item-content {
  background: rgba(0, 0, 0, 0.1);
  inset: 0 2px;
}
.grid-stack.grid-stack-nested {
  background: none;
  /* background-color: red; */
  /* take entire space */
  position: absolute;
  inset: 0; /* TODO change top: if you have content in nested grid */
}

/* 30 columns Stack Config */
.gs-30 > .grid-stack-item[gs-x='1'] {
  left: 3.33%;
}
.gs-30 > .grid-stack-item[gs-x='2'] {
  left: 6.66%;
}
.gs-30 > .grid-stack-item[gs-x='3'] {
  left: 9.99%;
}
.gs-30 > .grid-stack-item[gs-x='4'] {
  left: 13.32%;
}
.gs-30 > .grid-stack-item[gs-x='5'] {
  left: 16.65%;
}
.gs-30 > .grid-stack-item[gs-x='6'] {
  left: 19.98%;
}
.gs-30 > .grid-stack-item[gs-x='7'] {
  left: 23.31%;
}
.gs-30 > .grid-stack-item[gs-x='8'] {
  left: 26.64%;
}
.gs-30 > .grid-stack-item[gs-x='9'] {
  left: 29.97%;
}
.gs-30 > .grid-stack-item[gs-x='10'] {
  left: 33.33%;
}
.gs-30 > .grid-stack-item[gs-x='11'] {
  left: 36.63%;
}
.gs-30 > .grid-stack-item[gs-x='12'] {
  left: 39.96%;
}
.gs-30 > .grid-stack-item[gs-x='13'] {
  left: 43.29%;
}
.gs-30 > .grid-stack-item[gs-x='14'] {
  left: 46.62%;
}
.gs-30 > .grid-stack-item[gs-x='15'] {
  left: 49.95%;
}
.gs-30 > .grid-stack-item[gs-x='16'] {
  left: 53.28%;
}
.gs-30 > .grid-stack-item[gs-x='17'] {
  left: 56.61%;
}
.gs-30 > .grid-stack-item[gs-x='18'] {
  left: 59.94%;
}
.gs-30 > .grid-stack-item[gs-x='19'] {
  left: 63.27%;
}
.gs-30 > .grid-stack-item[gs-x='20'] {
  left: 66.6%;
}
.gs-30 > .grid-stack-item[gs-x='21'] {
  left: 69.93%;
}
.gs-30 > .grid-stack-item[gs-x='22'] {
  left: 73.26%;
}
.gs-30 > .grid-stack-item[gs-x='23'] {
  left: 76.59%;
}
.gs-30 > .grid-stack-item[gs-x='24'] {
  left: 79.92%;
}
.gs-30 > .grid-stack-item[gs-x='25'] {
  left: 83.25%;
}
.gs-30 > .grid-stack-item[gs-x='26'] {
  left: 86.58%;
}
.gs-30 > .grid-stack-item[gs-x='27'] {
  left: 89.91%;
}
.gs-30 > .grid-stack-item[gs-x='28'] {
  left: 93.24%;
}
.gs-30 > .grid-stack-item[gs-x='29'] {
  left: 96.57%;
}

.gs-30 > .grid-stack-item {
  width: 3.33%;
}
.gs-30 > .grid-stack-item[gs-w='2'] {
  width: 6.66%;
}
.gs-30 > .grid-stack-item[gs-w='3'] {
  width: 9.99%;
}
.gs-30 > .grid-stack-item[gs-w='4'] {
  width: 13.32%;
}
.gs-30 > .grid-stack-item[gs-w='5'] {
  width: 16.65%;
}
.gs-30 > .grid-stack-item[gs-w='6'] {
  width: 19.98%;
}
.gs-30 > .grid-stack-item[gs-w='7'] {
  width: 23.31%;
}
.gs-30 > .grid-stack-item[gs-w='8'] {
  width: 26.64%;
}
.gs-30 > .grid-stack-item[gs-w='9'] {
  width: 29.97%;
}
.gs-30 > .grid-stack-item[gs-w='10'] {
  width: 33.33%;
}
.gs-30 > .grid-stack-item[gs-w='11'] {
  width: 36.63%;
}
.gs-30 > .grid-stack-item[gs-w='12'] {
  width: 39.96%;
}
.gs-30 > .grid-stack-item[gs-w='13'] {
  width: 43.29%;
}
.gs-30 > .grid-stack-item[gs-w='14'] {
  width: 46.62%;
}
.gs-30 > .grid-stack-item[gs-w='15'] {
  width: 49.95%;
}
.gs-30 > .grid-stack-item[gs-w='16'] {
  width: 53.28%;
}
.gs-30 > .grid-stack-item[gs-w='17'] {
  width: 56.61%;
}
.gs-30 > .grid-stack-item[gs-w='18'] {
  width: 59.94%;
}
.gs-30 > .grid-stack-item[gs-w='19'] {
  width: 63.27%;
}
.gs-30 > .grid-stack-item[gs-w='20'] {
  width: 66.6%;
}
.gs-30 > .grid-stack-item[gs-w='21'] {
  width: 69.93%;
}
.gs-30 > .grid-stack-item[gs-w='22'] {
  width: 73.26%;
}
.gs-30 > .grid-stack-item[gs-w='23'] {
  width: 76.59%;
}
.gs-30 > .grid-stack-item[gs-w='24'] {
  width: 79.92%;
}
.gs-30 > .grid-stack-item[gs-w='25'] {
  width: 83.25%;
}
.gs-30 > .grid-stack-item[gs-w='26'] {
  width: 86.58%;
}
.gs-30 > .grid-stack-item[gs-w='27'] {
  width: 89.91%;
}
.gs-30 > .grid-stack-item[gs-w='28'] {
  width: 93.24%;
}
.gs-30 > .grid-stack-item[gs-w='29'] {
  width: 96.57%;
}
.gs-30 > .grid-stack-item[gs-w='30'] {
  width: 100%;
}
</style>
