import assert from 'assert'
import { transaction } from '.'
import { collection } from '../collection'
import nanoid from 'nanoid'
import set from '../set'
import { ref, Ref } from '../ref'
import get from '../get'

describe('transaction', () => {
  // TODO: For whatever reason these tests fail within the emulator environment
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    type Counter = { count: number; optional?: true }
    const counters = collection<Counter>('counters')

    beforeEach(() => {
      typeof jest !== 'undefined' && jest.setTimeout(20000)
    })

    const plusOne = async (counter: Ref<Counter>, useUpdate?: boolean) =>
      transaction(
        async ({ get }) => {
          const {
            data: { count }
          } = await get(counter)
          return count
        },
        async ({ data: count, set, update }) => {
          const newCount = count + 1
          const payload = { count: newCount }
          if (useUpdate) {
            await update(counter, payload)
          } else {
            await set(counter, payload)
          }
          return newCount
        }
      )

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

    it('allows updating', async () => {
      const id = nanoid()
      const counter = ref(counters, id)
      await set(counter, { count: 0 })
      await Promise.all([
        plusOne(counter, true),
        transaction(
          ({ get }) => get(counter),
          ({ data: counterFromDB, update }) =>
            update(counter, {
              count: counterFromDB.data.count + 1,
              optional: true
            })
        )
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
      await Promise.all([
        plusOne(counter, true),
        transaction(({ get }) => get(counter), ({ remove }) => remove(counter))
      ])
      const counterFromDB = await get(counter)
      assert(!counterFromDB)
    })
  } else {
    it('ignored because emulator fails on transactions', () => {})
  }
})
