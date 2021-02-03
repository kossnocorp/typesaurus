import assert from 'assert'
import { transaction } from '.'
import { collection } from '../collection'
import { nanoid } from 'nanoid'
import set from '../set'
import { ref, Ref } from '../ref'
import get from '../get'
import sinon from 'sinon'

describe('transaction', () => {
  type Counter = { count: number; optional?: true }
  const counters = collection<Counter>('counters')
  let warn: typeof console.warn

  beforeAll(() => {
    warn = console.warn
  })

  beforeEach(() => {
    typeof jest !== 'undefined' && jest.setTimeout(20000)
    console.warn = sinon.spy()
  })

  afterAll(() => {
    console.warn = warn
  })

  const plusOne = async (counter: Ref<Counter>, useUpdate?: boolean) =>
    transaction(
      async ({ get }) => {
        const doc = await get(counter)
        return doc?.data.count || 0
      },
      ({ data: count, set, update }) => {
        const newCount = count + 1
        const payload = { count: newCount }
        if (useUpdate) {
          update(counter, payload)
        } else {
          set(counter, payload)
        }
        return newCount
      }
    )

  it('performs transaction', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await Promise.all([plusOne(counter), plusOne(counter), plusOne(counter)])
    const doc = await get(counter)
    assert(doc?.data.count === 3)
  })

  it('returns the value from the write function', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    const results = await Promise.all([
      plusOne(counter),
      plusOne(counter),
      plusOne(counter)
    ])
    assert.deepEqual(results.sort(), [1, 2, 3])
  })

  it('allows upsetting', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0, optional: true })
    await transaction(
      ({ get }) => get(counter),
      ({ data: counterFromDB, upset }) =>
        upset(counter, { count: (counterFromDB?.data.count || 0) + 1 })
    )
    const doc = await get(counter)

    assert(doc?.data.count === 1)
    assert(doc?.data.optional)
  })

  it('allows updating', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await Promise.all([
      plusOne(counter, true),
      transaction(
        ({ get }) => get(counter),
        async ({ data: counterFromDB, update }) =>
          update(counter, {
            count: (counterFromDB?.data.count || 0) + 1,
            optional: true
          })
      )
    ])
    const doc = await get(counter)
    assert(doc?.data.count === 2)
    assert(doc?.data.optional)
  })

  it('allows removing', async () => {
    const id = nanoid()
    const counter = ref(counters, id)
    await set(counter, { count: 0 })
    await transaction(
      ({ get }) => get(counter),
      ({ remove }) => remove(counter)
    )
    const counterFromDB = await get(counter)
    assert(!counterFromDB)
  })
})
