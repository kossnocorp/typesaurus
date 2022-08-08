import { schema, Typesaurus } from '..'

describe('set', () => {
  interface User {
    name: string
  }

  interface Post {
    author: Typesaurus.Ref<User>
    text: string
    date?: Date
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    posts: $.collection<Post>()
  }))

  it('sets a document', async () => {
    const id = await db.id()
    await db.users.set(id, { name: 'Sasha' })
    const user = await db.users.get(id)
    expect(user?.data).toEqual({ name: 'Sasha' })
  })

  it('overwrites a document', async () => {
    const id = await db.id()
    await db.users.set(id, { name: 'Sasha' })
    await db.users.set(id, { name: 'Sasha Koss' })
    const user = await db.users.get(id)
    expect(user?.data).toEqual({ name: 'Sasha Koss' })
  })

  it('allows setting to refs', async () => {
    const id = await db.id()
    const userRef = db.users.ref(id)
    await userRef.set({ name: 'Sasha' })
    const user = await userRef.get()
    expect(user?.data).toEqual({ name: 'Sasha' })
  })

  it('supports references', async () => {
    const userId = await db.id()
    const postId = await db.id()
    await db.users.set(userId, { name: 'Sasha' })
    await db.posts.set(postId, { author: db.users.ref(userId), text: 'Hello!' })
    const postFromDB = await db.posts.get(postId)
    const userFromDB = postFromDB && (await postFromDB?.data.author.get())
    expect(userFromDB?.data).toEqual({ name: 'Sasha' })
  })

  it('supports dates', async () => {
    const date = new Date()
    const userRef = db.users.ref('42')
    const postId = await db.id()
    await db.posts.set(postId, { author: userRef, text: 'Hello!', date })
    const postFromDB = await db.posts.get(postId)
    expect(postFromDB?.data.date?.getTime()).toBe(date.getTime())
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
      const userId = await db.id()
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

    //     it('allows to assert environment which allows setting dates', async () => {
    //       // TODO: Find a way to make the error show on fields like when assertEnvironment: 'client'
    //       // @ts-expect-error
    //       await set(users, await db.id(), {
    //         name: 'Sasha',
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //         birthday: new Date(1987, 1, 11)
    //       })

    //       const nodeSet = () =>
    //         set(
    //           users,
    //           await db.id(),
    //           {
    //             name: 'Sasha',
    //             createdAt: new Date(),
    //             updatedAt: new Date(),
    //             birthday: new Date(1987, 1, 11)
    //           },
    //           { assertEnvironment: 'node' }
    //         )

    //       const webSet = () =>
    //         set(
    //           users,
    //           await db.id(),
    //           {
    //             name: 'Sasha',
    //             // @ts-expect-error
    //             createdAt: new Date(),
    //             // @ts-expect-error
    //             updatedAt: new Date(),
    //             birthday: new Date(1987, 1, 11)
    //           },
    //           { assertEnvironment: 'client' }
    //         )

    //       if (typeof window === 'undefined') {
    //         await nodeSet()
    //         try {
    //           await webSet()
    //           assert.fail('It should catch!')
    //         } catch (err) {
    //           assert(err.message === 'Expected web environment')
    //         }
    //       } else {
    //         await webSet()
    //         try {
    //           await nodeSet()
    //           assert.fail('It should catch!')
    //         } catch (err) {
    //           assert(err.message === 'Expected node environment')
    //         }
    //       }
    //     })
  })
})
