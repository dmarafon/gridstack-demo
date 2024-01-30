import { useFakeListApi, type FakeListType } from '../../api/useFakeListApi'
import { useTestListApi, type TestListType } from '../../api/useTestListApi'
import type { WidgetListData } from '../../api/useWorkAreaApi'

export const loadList = async (
  entity: WidgetListData['entityName']
): Promise<FakeListType | TestListType> => {
  const api = entity === 'Fake' ? useFakeListApi() : useTestListApi()

  const list = await api.getList()

  return list
}
