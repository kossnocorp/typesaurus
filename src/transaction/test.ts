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

  const plusOne = async (counter: Ref<Counter>) =>
    transaction(async ({ get, set }) => {
      const {
        data: { count }
      } = await get(counter)
      return set(counter, { count: count + 1 })
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
  }, 10000)

  it('allows updating', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await Promise.all([
      plusOne(counter),
      transaction(async ({ get, update }) => {
        await get(counter)
        await update(counter, { optional: true })
      })
    ])
    const {
      data: { count, optional }
    } = await get(counter)
    assert(count === 1)
    assert(optional)
  }, 10000)

  it('allows clearing', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await Promise.all([transaction(({ clear }) => clear(counter))])
    const counterFromDB = await get(counter)
    assert(!counterFromDB)
  }, 10000)
})
