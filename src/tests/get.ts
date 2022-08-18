import sinon from 'sinon'
import { schema, Typesaurus } from '..'

describe('get', () => {
  interface User {
    name: string
    lastOrder?: Typesaurus.Ref<[Order, 'users/orders']>
  }

  interface Post {
    author: Typesaurus.Ref<[User, 'users']>
    text: string
    date?: Date
  }

  interface Nope {}

  interface Order {
    title: string
  }

  const db = schema(($) => ({
    users: $.collection<User>().sub({
      orders: $.collection<Order>()
    }),
    posts: $.collection<Post>(),
    nope: $.collection<Nope>()
  }))

  it('allows to assert environment', async () => {
    const server = () => db.users.get(db.users.id('whatever'), { as: 'server' })
    const client = () => db.users.get(db.users.id('whatever'), { as: 'client' })

    if (typeof window === 'undefined') {
      await server()
      expect(client).toThrowError('Expected client environment')
    } else {
      await client()
      expect(server).toThrowError('Expected server environment')
    }
  })

  describe('ref', () => {
    it('allows to assert environment', async () => {
      const server = () =>
        db.users.ref(db.users.id('whatever')).get({ as: 'server' })
      const client = () =>
        db.users.ref(db.users.id('whatever')).get({ as: 'client' })

      if (typeof window === 'undefined') {
        await server()
        expect(client).toThrowError('Expected client environment')
      } else {
        await client()
        expect(server).toThrowError('Expected server environment')
      }
    })
  })

  describe('doc', () => {
    it('allows to assert environment', async () => {
      const doc = db.users.doc(db.users.id('whatever'), { name: 'Sasha' })

      const server = () => doc.get({ as: 'server' })
      const client = () => doc.get({ as: 'client' })

      if (typeof window === 'undefined') {
        await server()
        expect(client).toThrowError('Expected client environment')
      } else {
        await client()
        expect(server).toThrowError('Expected server environment')
      }
    })
  })

  describe('promise', () => {
    it('returns nothing if document is not present', async () => {
      const nothing = await db.nope.get(db.nope.id('nah'))
      expect(nothing).toBe(null)
    })

    it('expands references', async () => {
      const userRef = await db.users.add({ name: 'Sasha' })
      const postRef = await db.posts.add({
        author: userRef,
        text: 'Hello!'
      })
      const postFromDB = await postRef.get()

      expect(postFromDB?.data.author.type).toBe('ref')
      expect(postFromDB?.data.author.id).toBe(userRef.id)

      expect(postFromDB?.data.author.collection.type).toBe('collection')
      expect(postFromDB?.data.author.collection.path).toBe('users')

      const userFromDB = postFromDB && (await postFromDB.data.author.get())
      expect(userFromDB?.data).toEqual({ name: 'Sasha' })
    })

    it('expands dates', async () => {
      const date = new Date()
      const userRef = db.users.ref(db.users.id('42'))
      const post = await db.posts.add({
        author: userRef,
        text: 'Hello!',
        date
      })
      const postFromDB = await post.get()
      expect(postFromDB?.data.date?.getTime()).toBe(date.getTime())
    })

    describe('ref', () => {
      it('works on refs', async () => {
        const userRef = await db.users.add({ name: 'Sasha' })
        const user = await userRef.get()
        expect(user?.data).toEqual({ name: 'Sasha' })
      })
    })

    describe('doc', () => {
      it('works on docs', async () => {
        const userRef = await db.users.add({ name: 'Sasha' })
        const userDoc = await userRef.get()
        const user = await userDoc?.get()
        expect(user?.data).toEqual({ name: 'Sasha' })
      })
    })

    describe('subcollection', () => {
      it('works on subcollections', async () => {
        const userId = await db.users.id()

        const orderRef = await db
          .users(userId)
          .orders.add({ title: 'Amazing product' })

        const order = await db.users(userId).orders.get(orderRef.id)

        expect(order?.data.title).toBe('Amazing product')
      })

      it('expands references', async () => {
        const userId = await db.users.id()

        const orderRef = await db
          .users(userId)
          .orders.add({ title: 'Amazing product' })

        await db.users.set(userId, {
          name: 'Sasha',
          lastOrder: orderRef
        })

        const user = await db.users.get(userId)

        expect(user?.data.lastOrder?.type).toBe('ref')
        expect(user?.data.lastOrder?.id).toBe(orderRef.id)
        expect(user?.data.lastOrder?.collection.type).toBe('collection')
        expect(user?.data.lastOrder?.collection.path).toBe(
          `users/${userId}/orders`
        )
      })
    })
  })

  describe('subscription', () => {
    let off: (() => void) | undefined
    afterEach(() => {
      off && off()
      off = undefined
    })

    it('returns nothing if document is not present', () =>
      new Promise((resolve) => {
        off = db.nope.get(db.nope.id('nah')).on((nothing) => {
          expect(nothing).toBeNull()
          resolve(void 0)
        })
      }))

    it('allows to get by ref', async () => {
      const user = await db.users.add({ name: 'Sasha' })
      return new Promise((resolve) => {
        off = user.get().on((userFromDB) => {
          expect(userFromDB?.data).toEqual({ name: 'Sasha' })
          resolve(void 0)
        })
      })
    })

    it('expands references', async () => {
      const user = await db.users.add({ name: 'Sasha' })
      const post = await db.posts.add({
        author: user,
        text: 'Hello!'
      })
      return new Promise((resolve) => {
        off = db.posts.get(post.id).on(async (postFromDB) => {
          expect(postFromDB?.data.author.type).toBe('ref')
          expect(postFromDB?.data.author.id).toBe(user.id)

          expect(postFromDB?.data.author.collection.type).toBe('collection')
          expect(postFromDB?.data.author.collection.path).toBe('users')

          const userFromDB = await postFromDB?.data.author.get()
          expect(userFromDB?.data).toEqual({ name: 'Sasha' })
          resolve(void 0)
        })
      })
    })

    it('expands dates', async () => {
      const date = new Date()
      const userRef = db.users.ref(db.users.id('42'))
      const post = await db.posts.add({
        author: userRef,
        text: 'Hello!',
        date
      })

      return new Promise((resolve) => {
        off = db.posts.get(post.id).on((postFromDB) => {
          expect(postFromDB?.data.date?.getTime()).toBe(date.getTime())
          resolve(void 0)
        })
      })
    })

    describe('ref', () => {
      it('works on refs', async () => {
        const userRef = await db.users.add({ name: 'Sasha' })
        return new Promise((resolve) => {
          off = userRef.get().on((user) => {
            expect(user?.data).toEqual({ name: 'Sasha' })
            resolve(void 0)
          })
        })
      })
    })

    describe('doc', () => {
      it('works on docs', async () => {
        const userRef = await db.users.add({ name: 'Sasha' })
        const userDoc = await userRef.get()
        return new Promise((resolve) => {
          off = userDoc?.get().on((user) => {
            expect(user?.data).toEqual({ name: 'Sasha' })
            resolve(void 0)
          })
        })
      })
    })

    describe('subcollection', () => {
      it('works on subcollections', async () => {
        const userId = await db.users.id()

        const orderRef = await db
          .users(userId)
          .orders.add({ title: 'Amazing product' })

        return new Promise((resolve) => {
          off = db
            .users(userId)
            .orders.get(orderRef.id)
            .on((order) => {
              expect(order?.data.title).toBe('Amazing product')
              resolve(void 0)
            })
        })
      })

      it('expands references', async () => {
        const userId = await db.users.id()

        const orderRef = await db
          .users(userId)
          .orders.add({ title: 'Amazing product' })

        await db.users.set(userId, {
          name: 'Sasha',
          lastOrder: orderRef
        })

        return new Promise((resolve) => {
          off = db.users.get(userId).on((user) => {
            expect(user?.data.lastOrder?.type).toBe('ref')
            expect(user?.data.lastOrder?.id).toBe(orderRef.id)
            expect(user?.data.lastOrder?.collection.type).toBe('collection')
            expect(user?.data.lastOrder?.collection.path).toBe(
              `users/${userId}/orders`
            )
            resolve(void 0)
          })
        })
      })
    })

    describe('real-time', () => {
      it('subscribes to updates', async () => {
        const spy = sinon.spy()
        const user = await db.users.add({ name: 'Sasha' })
        return new Promise((resolve) => {
          off = user.get().on(async (doc) => {
            const name = doc?.data.name
            spy(name)
            if (name === 'Sasha') {
              await user.update({ name: 'Sasha Koss' })
            } else if (name === 'Sasha Koss') {
              expect(spy.calledWith('Sasha')).toBe(true)
              expect(spy.calledWith('Sasha Koss')).toBe(true)
              resolve(void 0)
            }
          })
        })
      })

      //   // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
      //   if (typeof window === undefined) {
      it('returns function that unsubscribes from the updates', () =>
        new Promise(async (resolve) => {
          const spy = sinon.spy()
          const user = await db.users.add({ name: 'Sasha' })
          const on = () => {
            off = user.get().on((doc) => {
              const name = doc?.data.name
              spy(name)
              if (name === 'Sasha Koss') {
                off?.()
                expect(spy.neverCalledWith('Sashka')).toBe(true)
                expect(spy.calledWith('Sasha Koss'))
                resolve(void 0)
              }
            })
          }
          on()
          off?.()
          await user.update({ name: 'Sashka' })
          await user.update({ name: 'Sasha Koss' })
          on()
        }))
      // }
    })
  })
})
