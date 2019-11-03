import { collection } from '../collection'
import set from '../set'
import getMany from '.'
import remove from '../remove'

describe('getMany', () => {
  type Fruit = { color: string }

  const fruits = collection<Fruit>('fruits')

  beforeAll(async () => {
    await Promise.all([
      set(fruits, 'apple', { color: 'green' }),
      set(fruits, 'banana', { color: 'yellow' }),
      set(fruits, 'orange', { color: 'orange' })
    ])
  })

  afterAll(async () => {
      await Promise.all([
        remove(fruits, 'apple'),
        remove(fruits, 'banana'),
        remove(fruits, 'orange'),
      ])
  })

  it('returns nothing when called with empty array', async () => {
    const list = await getMany(fruits, [])
    expect(list).toHaveLength(0)
  })

  it('allows to get single doc by id', async () => {
    const fruitsFromDB = await getMany(fruits, ['apple'])
    expect(fruitsFromDB).toHaveLength(1)
    expect(fruitsFromDB[0].__type__).toBe('doc')
    expect(fruitsFromDB[0].data.color).toBe('green')
    expect(fruitsFromDB[0].ref.id).toBe('apple')
    expect(fruitsFromDB[0].ref.collection.path).toBe('fruits')
  })

  it('allows to get multiple docs by id', async () => {
    const fruitsFromDB = await getMany(fruits, ['banana', 'apple', 'banana', 'orange'])
    expect(fruitsFromDB).toHaveLength(4)
    expect(fruitsFromDB[0].ref.id).toBe('banana')
    expect(fruitsFromDB[1].ref.id).toBe('apple')
    expect(fruitsFromDB[2].ref.id).toBe('banana')
    expect(fruitsFromDB[3].ref.id).toBe('orange')
  })

  it('throws an error when an id is missing', async () => {
    const promise = getMany(fruits, ['nonexistant'])
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Missing document with id nonexistant"`
    )
  })

  it('allows to specify custom logic when a document is not found', async () => {
    const list = await getMany(fruits, ['nonexistant'], (id) => ({ color: `${id} is missing but I filled it in` }))
    expect(list).toHaveLength(1)
    expect(list[0].data.color).toBe('nonexistant is missing but I filled it in')
  })

  it('allows to ignore missing documents', async () => {
    const list = await getMany(fruits, ['apple', 'nonexistant', 'banana'], 'ignore')
    expect(list).toHaveLength(2)
  })
})
