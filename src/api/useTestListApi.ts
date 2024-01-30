import { createUUID } from '../utils/createUUID'

export type TestListType = {
  totalItems: number
  items: { id: string; name: string; extra?: number }[]
}

const list: TestListType = {
  totalItems: 14,
  items: [
    { id: createUUID(), name: 'Test, Tesssst 1', extra: 22 },
    { id: createUUID(), name: 'Test, Tesssst 2', extra: 44 },
    { id: createUUID(), name: 'Test, Tesssst 3', extra: 3 },
    { id: createUUID(), name: 'Test, Tesssst 4' },
    { id: createUUID(), name: 'Test, Tesssst 5' },
    { id: createUUID(), name: 'Test, Tesssst 6' },
    { id: createUUID(), name: 'Test, Tesssst 7' },
    { id: createUUID(), name: 'Test, Tesssst 8', extra: 5 },
    { id: createUUID(), name: 'Test, Tesssst 9' },
    { id: createUUID(), name: 'Test, Tesssst 10' },
    { id: createUUID(), name: 'Test, Tesssst 11' },
    { id: createUUID(), name: 'Test, Tesssst 12' },
    { id: createUUID(), name: 'Test, Tesssst 13' },
    { id: createUUID(), name: 'Test, Tesssst 14' },
  ],
}

export const useTestListApi = () => ({
  getList: () => Promise.resolve(list),
})
