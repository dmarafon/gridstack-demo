import { defineAsyncComponent } from 'vue'
import type { Widget } from '../../api/useWorkAreaApi'

const getComponentLoader = (type: Widget) => {
  if (type === 'list') return () => import('./ListWidget.vue')

  if (type === 'text') return () => import('./TextWidget.vue')

  return () => Promise.resolve({ default: {} })
}

export const getWidgetComponent = (type: Widget) => {
  const cmp = defineAsyncComponent({
    loader: getComponentLoader(type),
  })

  return cmp
}
