import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import type { Workspace } from './api/useWorkAreaApi'
import './style.css'
import { createUUID } from './utils/createUUID'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)

app.mount('#app')

const defaultWorkspace: Workspace = {
  id: 'default',
  name: 'default',
  canEdit: true,

  widgets: [
    {
      id: createUUID(),
      type: 'text',
      position: { x: 2, y: 2 },
      size: { h: 2, w: 2 },
      data: { text: 'MYDATA' },
    },
    {
      id: createUUID(),
      type: 'text',
      position: { x: 9, y: 4 },
      size: { w: 3 },
      data: { text: 'YOUR DATA' },
    },
    {
      id: createUUID(),
      type: 'text',
      position: { x: 2, y: 2 },
      size: { h: 2, w: 4 },
      data: { text: 'WHAT DATA' },
    },
    {
      id: createUUID(),
      type: 'text',
      position: { x: 3, y: 2 },
      size: { h: 2, w: 2 },
      data: { text: 'SUPERDATA' },
    },
    {
      id: createUUID(),
      type: 'text',
      position: { x: 0, y: 6 },
      size: { w: 2, h: 2 },
      data: { text: 'NEGA DATA' },
    },
  ],
}

const myWorkspace: Workspace = {
  id: createUUID(),
  name: 'My Custom Workspace',
  canEdit: true,
  widgets: [
    {
      id: createUUID(),
      type: 'text',
      position: { x: 2, y: 2 },
      size: { h: 2, w: 2 },
      data: { text: 'MYDATA' },
    },
    {
      id: createUUID(),
      type: 'list',
      position: { x: 9, y: 4 },
      size: { w: 3 },
      data: {
        entityName: 'Test',
      },
    },
  ],
}

const workspaces: Workspace[] = [defaultWorkspace, myWorkspace]

if (!localStorage.getItem('workspaces')) {
  const data = JSON.stringify(workspaces)

  localStorage.setItem('workspaces', data)

  console.log(JSON.parse(data))
}
