import type { GridItemHTMLElement } from 'gridstack'

export type Widget = 'list' | 'text'

export type WidgetListData = {
  entityName: 'Test' | 'Fake'
}

export type WidgetTextData = { text: string }

export type WorkspaceWidget = {
  id: string
  type: Widget
  position?: { x?: number; y?: number }
  size?: { h?: number; w?: number; maxH?: number; maxW?: number }
  element?: GridItemHTMLElement
  data: WidgetListData | WidgetTextData
}

export type Workspace = { id: string; name: string; widgets?: WorkspaceWidget[]; canEdit: boolean }

export const useWorkspaceApi = () => ({
  getWorkspaceList: (): Promise<Workspace[]> =>
    new Promise(res => {
      const workspaces = localStorage.getItem('workspaces')

      if (workspaces === null) res([])

      res(JSON.parse(workspaces as string) as Workspace[])
    }),

  saveWorkspace: (workspaces: Workspace[]): Promise<{ res: true }> =>
    new Promise(res => {
      localStorage.clear()

      const data = JSON.stringify(workspaces)

      localStorage.setItem('workspaces', data)

      res({ res: true })
    }),
})
