import assert from 'assert'
import { transaction } from '.'
import { collection } from '../collection'
import nanoid from 'nanoid'
import set from '../set'
import { ref, Ref } from '../ref'
import get from '../get'

describe('transaction', () => {
  type Counter = { count: number; optional?: true }
  const counters = collection<Counter>('counters')

  beforeEach(() => {
    typeof jest !== 'undefined' && jest.setTimeout(20000)
  })

  const plusOne = async (counter: Ref<Counter>, useUpdate?: boolean) =>
    transaction(async ({ get, set, update }) => {
      const {
        data: { count }
      } = await get(counter)
      const payload = { count: count + 1 }
      if (useUpdate) {
        return update(counter, payload)
      } else {
        return set(counter, payload)
      }
    })

  it('performs transaction', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await Promise.all([plusOne(counter), plusOne(counter), plusOne(counter)])
    const {
      data: { count }
    } = await get(counter)
    assert(count === 3)
  })

  it('allows updating', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await Promise.all([
      plusOne(counter, true),
      transaction(async ({ get, update }) => {
        const counterFromDB = await get(counter)
        await update(counter, {
          count: counterFromDB.data.count + 1,
          optional: true
        })
      })
    ])
    const {
      data: { count, optional }
    } = await get(counter)
    assert(count === 2)
    assert(optional)
  })

  it('allows removing', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await Promise.all([transaction(({ remove }) => remove(counter))])
    const counterFromDB = await get(counter)
    assert(!counterFromDB)
  })
})
