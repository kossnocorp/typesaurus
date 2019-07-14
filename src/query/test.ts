import assert from 'assert'
import nanoid from 'nanoid'
import store from '..'
import query from '.'
import { collection } from '../collection'

describe('query', () => {
  type Contact = { ownerId: string; name: string; year: number }
  const contacts = collection<Contact>('contacts')
  const ownerId = nanoid()

  beforeAll(async () => {
    await store.add(contacts, { ownerId, name: 'Lesha', year: 1995 })
    await store.add(contacts, { ownerId, name: 'Sasha', year: 1987 })
    await store.add(contacts, { ownerId, name: 'Tati', year: 1989 })
  })

  it('queries documents', async () => {
    const docs = await query(contacts, [
      store.where('ownerId', '==', ownerId),
      store.order('year', 'asc')
    ])
    assert.deepEqual(docs.map(({ data: { name } }) => name), [
      'Sasha',
      'Tati',
      'Lesha'
    ])
  })

  it('allows to order by desc', async () => {
    const docs = await query(contacts, [
      store.where('ownerId', '==', ownerId),
      store.order('year', 'desc')
    ])
    assert.deepEqual(docs.map(({ data: { name } }) => name), [
      'Lesha',
      'Tati',
      'Sasha'
    ])
  })

  it('allows to query by value in maps', async () => {
    type Location = { mapId: string; name: string; address: { city: string } }
    const locations = collection<Location>('locations')
    const mapId = nanoid()
    await store.add(locations, {
      mapId,
      name: 'Pizza City',
      address: { city: 'New York' }
    })
    await store.add(locations, {
      mapId,
      name: 'Bagels Tower',
      address: { city: 'New York' }
    })
    await store.add(locations, {
      mapId,
      name: 'Tacos Cave',
      address: { city: 'Houston' }
    })
    const docs = await query(locations, [
      store.where('mapId', '==', mapId),
      store.where(['address', 'city'], '==', 'New York')
    ])
    assert.deepEqual(docs.map(({ data: { name } }) => name).sort(), [
      'Bagels Tower',
      'Pizza City'
    ])
  })

  describe('.limit', () => {
    it('limits documents', async () => {
      const docs = await query(contacts, [
        store.where('ownerId', '==', ownerId),
        store.order('year', 'asc'),
        store.limit(2)
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Sasha',
        'Tati'
      ])
    })
  })
})
