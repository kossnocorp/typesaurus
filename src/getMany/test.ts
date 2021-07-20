import { getMany } from '.'
import { collection } from '../collection'
import { remove } from '../remove'
import { set } from '../set'

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
      remove(fruits, 'orange')
    ])
  })

  it('returns nothing when called with empty array', async () => {
    const list = await getMany(fruits, [])
    expect(list.length).toBe(0)
  })

  it('allows to get single doc by id', async () => {
    const fruitsFromDB = await getMany(fruits, ['apple'])
    expect(fruitsFromDB.length).toBe(1)
    expect(fruitsFromDB[0].__type__).toBe('doc')
    expect(fruitsFromDB[0].data.color).toBe('green')
    expect(fruitsFromDB[0].ref.id).toBe('apple')
    expect(fruitsFromDB[0].ref.collection.path).toBe('fruits')
  })

  it('allows to get multiple docs by id', async () => {
    const fruitsFromDB = await getMany(fruits, [
      'banana',
      'apple',
      'banana',
      'orange'
    ])
    expect(fruitsFromDB.length).toBe(4)
    expect(fruitsFromDB[0].ref.id).toBe('banana')
    expect(fruitsFromDB[1].ref.id).toBe('apple')
    expect(fruitsFromDB[2].ref.id).toBe('banana')
    expect(fruitsFromDB[3].ref.id).toBe('orange')
  })

  it('throws an error when an id is missing', () =>
    getMany(fruits, ['nonexistant'])
      .then(() => {
        throw new Error('The promise should be rejected')
      })
      .catch((err) => {
        expect(err.message).toBe('Missing document with id nonexistant')
      }))

  it('allows to specify custom logic when a document is not found', async () => {
    const list = await getMany(fruits, ['nonexistant'], {
      onMissing: (id) => ({ color: `${id} is missing but I filled it in` })
    })
    expect(list.length).toBe(1)
    expect(list[0].data.color).toBe('nonexistant is missing but I filled it in')
  })

  it('allows to ignore missing documents', async () => {
    const list = await getMany(fruits, ['apple', 'nonexistant', 'banana'], {
      onMissing: 'ignore'
    })
    expect(list.length).toBe(2)
  })
})
