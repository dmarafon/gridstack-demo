import { createUUID } from '../utils/createUUID'

export type FakeListType = { totalItems: number; items: { id: string; name: string }[] }

const list: FakeListType = {
  totalItems: 6,
  items: [
    { id: createUUID(), name: 'Fake 1' },
    { id: createUUID(), name: 'Fake 2' },
    { id: createUUID(), name: 'Fake 3' },
    { id: createUUID(), name: 'Fake 4' },
    { id: createUUID(), name: 'Fake 5' },
    { id: createUUID(), name: 'Fake 6' },
  ],
}

export const useFakeListApi = () => ({
  getList: () => Promise.resolve(list),
})
