import assert from 'assert'
import nanoid from 'nanoid'
import store from '.'
import { collection, Collection } from './collection'

describe('store', () => {
  type User = { name: string }
  const users = collection<User>('users')

  type Order = { sum: number }
  type Item = { name: string }
  type OrderNested = { items: Collection<Order> }
  const items = collection<Item>('items')
  const orders = collection<Order, OrderNested>('orders', { items })
  type Category = { name: string }
  type CategoryNested = { items: Collection<Order> }
  const categories = collection<Category, CategoryNested>('category', { items })

  // categories.nested.items
  // orders.nested.items

  describe('.set/.get', () => {
    it('sets and reads document', async () => {
      const id = nanoid()
      await store.set(users, id, { name: 'Sasha' })
      const user = await store.get(users, id)
      assert.deepEqual(user.data, { name: 'Sasha' })
    })

    it('set returns nothing if document is not present', async () => {
      const nothing = await store.get(collection('nope'), 'nah')
      assert(nothing === undefined)
    })

    it('get returns doc', async () => {
      const id = nanoid()
      const data = { name: 'Sasha' }
      const user = await store.set(users, id, data)
      assert.deepEqual(user, {
        __type__: 'doc',
        ref: { __type__: 'ref', collection: users, id },
        data
      })
    })

    describe.skip('nested collections', () => {
      it('allows to set and get nested collections', async () => {
        const id = nanoid()
        const data = { name: 'Sasha' }
        const orders = collection<Order>('orders')
        const user = await store.set(users, id, data)

        assert.deepEqual(user, {
          __type__: 'doc',
          ref: { __type__: 'ref', collection: users, id },
          data
        })
      })
    })
  })

  describe('.add', () => {
    it('adds document to collection', async () => {
      const data = { name: 'Sasha' }
      const user = await store.add(users, data)
      const { id } = user.ref
      assert(typeof id === 'string')
      const userFromDB = await store.get(users, id)
      assert.deepEqual(userFromDB.data, data)
    })
  })

  describe('.update', () => {
    it('updates document', async () => {
      const user = await store.add(users, { name: 'Sasha' })
      const { id } = user.ref
      await store.update(users, id, { name: 'Sasha Koss' })
      const userFromDB = await store.get(users, id)
      assert.deepEqual(userFromDB.data, { name: 'Sasha Koss' })
    })
  })

  describe('.clear', () => {
    it('removes document', async () => {
      const user = await store.add(users, { name: 'Sasha' })
      const { id } = user.ref
      await store.clear(users, id)
      const userfromdb = await store.get(users, id)
      assert(userfromdb === undefined)
    })
  })

  describe('.query/.where/.order', () => {
    type Contact = { ownerId: string; name: string; year: number }
    const contacts = collection<Contact>('contacts')
    const ownerId = nanoid()

    beforeAll(async () => {
      await store.add(contacts, { ownerId, name: 'Lesha', year: 1995 })
      await store.add(contacts, { ownerId, name: 'Sasha', year: 1987 })
      await store.add(contacts, { ownerId, name: 'Tati', year: 1989 })
    })

    it('queries documents', async () => {
      const docs = await store.query(contacts, [
        store.where('ownerId', '==', ownerId),
        store.order('year', 'asc')
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Sasha',
        'Tati',
        'Lesha'
      ])
    })

    it('allows desc', async () => {
      const docs = await store.query(contacts, [
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
      const docs = await store.query(locations, [
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
        const docs = await store.query(contacts, [
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
})
