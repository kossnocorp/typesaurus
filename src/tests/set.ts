import { schema, Typesaurus } from '..'

describe('set', () => {
  interface User {
    name: string
  }

  interface Post {
    author: Typesaurus.Ref<[User, 'users']>
    text: string
    date?: Date
  }

  interface Order {
    title: string
  }

  const db = schema(($) => ({
    users: $.collection<User>().sub({
      orders: $.collection<Order>()
    }),
    posts: $.collection<Post>()
  }))

  interface UserWithDates {
    name: string
    createdAt: Typesaurus.ServerDate
    updatedAt?: Typesaurus.ServerDate
    birthday: Date
  }

  const dbWithDates = schema(($) => ({
    users: $.collection<UserWithDates>()
  }))

  it('sets a document', async () => {
    const id = await db.users.id()
    await db.users.set(id, { name: 'Sasha' })
    const user = await db.users.get(id)
    expect(user?.data).toEqual({ name: 'Sasha' })
  })

  it('overwrites a document', async () => {
    const id = await db.users.id()
    await db.users.set(id, { name: 'Sasha' })
    await db.users.set(id, { name: 'Sasha Koss' })
    const user = await db.users.get(id)
    expect(user?.data).toEqual({ name: 'Sasha Koss' })
  })

  it('supports references', async () => {
    const userId = await db.users.id()
    const postId = await db.posts.id()
    await db.users.set(userId, { name: 'Sasha' })
    await db.posts.set(postId, { author: db.users.ref(userId), text: 'Hello!' })
    const postFromDB = await db.posts.get(postId)
    const userFromDB = postFromDB && (await postFromDB?.data.author.get())
    expect(userFromDB?.data).toEqual({ name: 'Sasha' })
  })

  it('supports dates', async () => {
    const date = new Date()
    const userRef = db.users.ref(db.users.id('42'))
    const postId = await db.posts.id()
    await db.posts.set(postId, { author: userRef, text: 'Hello!', date })
    const postFromDB = await db.posts.get(postId)
    expect(postFromDB?.data.date?.getTime()).toBe(date.getTime())
  })

  it('allows to assert environment', async () => {
    const userId = await db.users.id()

    const server = () =>
      dbWithDates.users.set(
        userId,
        {
          name: 'Sasha',
          createdAt: new Date(),
          updatedAt: new Date(),
          birthday: new Date(1987, 1, 11)
        },
        { as: 'server' }
      )

    const client = () =>
      dbWithDates.users.set(
        userId,
        ($) => ({
          name: 'Sasha',
          createdAt: $.serverDate(),
          updatedAt: $.serverDate(),
          birthday: new Date(1987, 1, 11)
        }),
        { as: 'client' }
      )

    if (typeof window === 'undefined') {
      await server()
      expect(client).toThrowError('Expected client environment')
    } else {
      await client()
      expect(server).toThrowError('Expected server environment')
    }
  })

  describe('ref', () => {
    it('works on refs', async () => {
      const id = await db.users.id()
      const userRef = db.users.ref(id)
      await userRef.set({ name: 'Sasha' })
      const user = await userRef.get()
      expect(user?.data).toEqual({ name: 'Sasha' })
    })

    it('allows to assert environment', async () => {
      const userId = await db.users.id()

      const server = () =>
        dbWithDates.users.ref(userId).set(
          {
            name: 'Sasha',
            createdAt: new Date(),
            updatedAt: new Date(),
            birthday: new Date(1987, 1, 11)
          },
          { as: 'server' }
        )

      const client = () =>
        dbWithDates.users.ref(userId).set(
          ($) => ({
            name: 'Sasha',
            createdAt: $.serverDate(),
            updatedAt: $.serverDate(),
            birthday: new Date(1987, 1, 11)
          }),
          { as: 'client' }
        )

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
    it('works on docs', async () => {
      const id = await db.users.id()
      const userRef = db.users.ref(id)
      await userRef.set({ name: 'Alexander' })
      const userDoc = await userRef.get()
      await userDoc?.set({ name: 'Sasha' })
      const user = await userRef.get()
      expect(user?.data).toEqual({ name: 'Sasha' })
    })

    it('allows to assert environment', async () => {
      // @ts-ignore: data is not important here
      const doc = dbWithDates.users.doc('whatever', {})

      const server = () =>
        doc.set(
          {
            name: 'Sasha',
            createdAt: new Date(),
            updatedAt: new Date(),
            birthday: new Date(1987, 1, 11)
          },
          { as: 'server' }
        )

      const client = () =>
        doc.set(
          ($) => ({
            name: 'Sasha',
            createdAt: $.serverDate(),
            updatedAt: $.serverDate(),
            birthday: new Date(1987, 1, 11)
          }),
          { as: 'client' }
        )

      if (typeof window === 'undefined') {
        await server()
        expect(client).toThrowError('Expected client environment')
      } else {
        await client()
        expect(server).toThrowError('Expected server environment')
      }
    })
  })

  describe('subcollection', () => {
    it('works on subcollections', async () => {
      const userId = await db.users.id()
      const orderId = await db.users(userId).orders.id()
      const orderRef = await db
        .users(userId)
        .orders.set(orderId, { title: 'Amazing product' })
      const order = await db.users(userId).orders.get(orderRef.id)
      expect(order?.data.title).toBe('Amazing product')
    })
  })

  describe('server dates', () => {
    interface User {
      name: string
      createdAt: Typesaurus.ServerDate
      updatedAt?: Typesaurus.ServerDate
      birthday: Date
    }

    const db = schema(($) => ({
      users: $.collection<User>()
    }))

    it('supports server dates', async () => {
      const userId = await db.users.id()
      await db.users.set(userId, ($) => ({
        name: 'Sasha',
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        birthday: new Date(1987, 1, 11)
      }))
      const user = await db.users.get(userId)
      const now = Date.now()
      const returnedDate = user?.data.createdAt
      expect(returnedDate).not.toBeUndefined()
      expect(returnedDate).toBeInstanceOf(Date)
      expect(
        returnedDate!.getTime() <= now && returnedDate!.getTime() > now - 10000
      ).toBe(true)
    })
  })
})
