import assert from 'assert'
import nanoid from 'nanoid'
import store from '..'
import query from '.'
import { collection } from '../collection'
import order from '../order'
import { startAfter, startAt, endBefore, endAt } from '../cursor'

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
    const docs = await query(contacts, [store.where('ownerId', '==', ownerId)])
    assert.deepEqual(docs.map(({ data: { name } }) => name).sort(), [
      'Lesha',
      'Sasha',
      'Tati'
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

  describe('ordering', () => {
    it('allows to order', async () => {
      const docs = await query(contacts, [
        store.where('ownerId', '==', ownerId),
        order('year', 'asc')
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
        order('year', 'desc')
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Lesha',
        'Tati',
        'Sasha'
      ])
    })
  })

  describe('limiting', () => {
    it('allows to limit response length', async () => {
      const docs = await query(contacts, [
        store.where('ownerId', '==', ownerId),
        order('year', 'asc'),
        store.limit(2)
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Sasha',
        'Tati'
      ])
    })
  })

  describe('paginating', () => {
    describe('startAfter', () => {
      it('allows to paginate', async () => {
        const page1Docs = await query(contacts, [
          store.where('ownerId', '==', ownerId),
          order('year', 'asc', [startAfter(undefined)]),
          store.limit(2)
        ])
        assert.deepEqual(page1Docs.map(({ data: { name } }) => name), [
          'Sasha',
          'Tati'
        ])
        const page2Docs = await query(contacts, [
          store.where('ownerId', '==', ownerId),
          order('year', 'asc', [startAfter(page1Docs[1].data.year)]),
          store.limit(2)
        ])
        assert.deepEqual(page2Docs.map(({ data: { name } }) => name), ['Lesha'])
      })
    })

    describe('startAt', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          store.where('ownerId', '==', ownerId),
          order('year', 'asc', [startAt(1989)]),
          store.limit(2)
        ])
        assert.deepEqual(docs.map(({ data: { name } }) => name), [
          'Tati',
          'Lesha'
        ])
      })
    })

    describe('endBefore', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          store.where('ownerId', '==', ownerId),
          order('year', 'asc', [endBefore(1989)]),
          store.limit(2)
        ])
        assert.deepEqual(docs.map(({ data: { name } }) => name), ['Sasha'])
      })
    })

    describe('endAt', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          store.where('ownerId', '==', ownerId),
          order('year', 'asc', [endAt(1989)]),
          store.limit(2)
        ])
        assert.deepEqual(docs.map(({ data: { name } }) => name), [
          'Sasha',
          'Tati'
        ])
      })
    })

    it('uses asc ordering method by default', async () => {
      const docs = await query(contacts, [
        store.where('ownerId', '==', ownerId),
        order('year', [startAt(1989)]),
        store.limit(2)
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Tati',
        'Lesha'
      ])
    })

    it('allows specify multiple cursor conditions', async () => {
      type City = { mapId: string; name: string; state: string }
      const cities = collection<City>('cities')
      const mapId = nanoid()
      await Promise.all([
        store.add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Massachusetts'
        }),
        store.add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Missouri'
        }),
        store.add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Wisconsin'
        })
      ])
      const docs = await query(cities, [
        store.where('mapId', '==', mapId),
        order('name', 'asc', [startAt('Springfield')]),
        order('state', 'asc', [startAt('Missouri')]),
        store.limit(2)
      ])
      assert.deepEqual(
        docs.map(({ data: { name, state } }) => `${name}, ${state}`),
        ['Springfield, Missouri', 'Springfield, Wisconsin']
      )
    }, 10000)

    it('allows to combine cursors', async () => {
      const docs = await query(contacts, [
        store.where('ownerId', '==', ownerId),
        order('year', 'asc', [startAt(1989), endAt(1989)]),
        store.limit(2)
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), ['Tati'])
    })
  })
})
