import assert from 'assert'
import nanoid from 'nanoid'
import db from '.'
import { collection, Collection } from './collection'

describe('db', () => {
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

  orders.nested.items

  describe('.set/.get', () => {
    it('sets and reads document', async () => {
      const id = nanoid()
      await db.set(users, id, { name: 'Sasha' })
      const user = await db.get(users, id)
      assert.deepEqual(user.data, { name: 'Sasha' })
    })

    it('set returns nothing if document is not present', async () => {
      const nothing = await db.get(collection('nope'), 'nah')
      assert(nothing === undefined)
    })

    it('get returns doc', async () => {
      const id = nanoid()
      const data = { name: 'Sasha' }
      const user = await db.set(users, id, data)
      assert.deepEqual(user, {
        __type__: 'doc',
        ref: { __type__: 'ref', collection: users, id },
        data
      })
    })

    describe('nested collections', () => {
      it('allows to set and get nested collections', async () => {
        const id = nanoid()
        const data = { name: 'Sasha' }
        const orders = collection<Order>('orders')
        const user = await db.set(users, id, data)

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
      const user = await db.add(users, data)
      const { id } = user.ref
      assert(typeof id === 'string')
      const userFromDB = await db.get(users, id)
      assert.deepEqual(userFromDB.data, data)
    })
  })

  describe('.update', () => {
    it('updates document', async () => {
      const user = await db.add(users, { name: 'Sasha' })
      const { id } = user.ref
      await db.update(users, id, { name: 'Sasha Koss' })
      const userFromDB = await db.get(users, id)
      assert.deepEqual(userFromDB.data, { name: 'Sasha Koss' })
    })
  })

  describe('.clear', () => {
    it('removes document', async () => {
      const user = await db.add(users, { name: 'Sasha' })
      const { id } = user.ref
      await db.clear(users, id)
      const userfromdb = await db.get(users, id)
      assert(userfromdb === undefined)
    })
  })

  describe('.query/.where/.order', () => {
    type Contact = { ownerId: string; name: string; year: number }
    const contacts = collection<Contact>('contacts')
    const ownerId = nanoid()

    beforeAll(async () => {
      await db.add(contacts, { ownerId, name: 'Lesha', year: 1995 })
      await db.add(contacts, { ownerId, name: 'Sasha', year: 1987 })
      await db.add(contacts, { ownerId, name: 'Tati', year: 1989 })
    })

    it('queries documents', async () => {
      const docs = await db.query(contacts, [
        db.where('ownerId', '==', ownerId),
        db.order('year', 'asc')
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Sasha',
        'Tati',
        'Lesha'
      ])
    })

    it('allows desc', async () => {
      const docs = await db.query(contacts, [
        db.where('ownerId', '==', ownerId),
        db.order('year', 'desc')
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Lesha',
        'Tati',
        'Sasha'
      ])
    })

    describe('.limit', () => {
      it('limits documents', async () => {
        const docs = await db.query(contacts, [
          db.where('ownerId', '==', ownerId),
          db.order('year', 'asc'),
          db.limit(2)
        ])
        assert.deepEqual(docs.map(({ data: { name } }) => name), [
          'Sasha',
          'Tati'
        ])
      })
    })
  })

  // describe('getRefPath', () => {
  //   it('returns full document path', () => {
  //     assert(
  //       getRefPath({
  //         __type__: 'ref',
  //         id: '42',
  //         collection: users
  //       }) === 'users/42'
  //     )
  //   })
  // })

  // describe('setRef/getRef', () => {
  //   it('sets value to an item in collection with the given value', async () => {
  //     const id = nanoid()
  //     const userRef = ref(users, id)
  //     const userData = { name: 'Sasha' }
  //     await setRef(userRef, userData)
  //     const userFromDB = await getRef(userRef)
  //     assert.deepEqual(userFromDB.data, userData)
  //   })

  //   it('returns doc', async () => {
  //     const id = nanoid()
  //     const userRef = ref(users, id)
  //     const userData = { name: 'Sasha' }
  //     const userDoc = await setRef(userRef, userData)

  //     assert.deepEqual(userDoc, {
  //       __type__: 'doc',
  //       ref: userRef,
  //       data: userData
  //     })
  //   })
  // })

  // describe('deleteRef', () => {
  //   it('deletes existing document', async () => {
  //     const id = nanoid()
  //     const userRef = ref(users, id)
  //     const userData = { name: 'Sasha' }
  //     await setRef(userRef, userData)
  //     await deleteRef(userRef)

  //     const userItem = await getRef(userRef)
  //     assert(userItem === null)
  //   })
  // })
})
