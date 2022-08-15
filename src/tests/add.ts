import { schema, Typesaurus } from '..'

describe('add', () => {
  interface User {
    name: string
  }

  interface Post {
    author: Typesaurus.Ref<[User, 'users']>
    text: string
    date?: Date
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    posts: $.collection<Post>()
  }))

  it('adds document to collection', async () => {
    const data = { name: 'Sasha' }
    const userRef = await db.users.add(data)
    const { id } = userRef
    expect(typeof userRef.id).toBe('string')
    const userFromDB = await db.users.get(id)
    expect(userFromDB?.data).toEqual(data)
  })

  it('supports references', async () => {
    const userRef = await db.users.add({ name: 'Sasha' })
    const postRef = await db.posts.add({
      author: userRef,
      text: 'Hello!'
    })
    const postFromDB = await postRef.get()
    const userFromDB = postFromDB && (await postFromDB.data.author.get())
    expect(userFromDB?.data).toEqual({ name: 'Sasha' })
  })

  it('supports dates', async () => {
    const userRef = db.users.ref(db.users.id('42'))
    const date = new Date()
    const postRef = await db.posts.add({
      author: userRef,
      text: 'Hello!',
      date
    })
    const postFromDB = await postRef.get()
    expect(postFromDB?.data.date).toBeInstanceOf(Date)
    expect(postFromDB?.data.date?.getTime()).toBe(date.getTime())
  })

  it('allows to assert environment', async () => {
    interface User {
      name: string
      createdAt: Typesaurus.ServerDate
      updatedAt?: Typesaurus.ServerDate
      birthday: Date
    }

    const db = schema(($) => ({
      users: $.collection<User>()
    }))

    const server = () =>
      db.users.add(
        {
          name: 'Sasha',
          createdAt: new Date(),
          updatedAt: new Date(),
          birthday: new Date(1987, 1, 11)
        },
        { as: 'server' }
      )

    const client = () =>
      db.users.add(
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
      const userRef = await db.users.add(($) => ({
        name: 'Sasha',
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        birthday: new Date(1987, 1, 11)
      }))
      const user = await userRef.get()
      const now = Date.now()
      const returnedDate = user?.data.createdAt
      expect(returnedDate).not.toBeUndefined()
      expect(returnedDate).toBeInstanceOf(Date)
      expect(
        returnedDate!.getTime() <= now && returnedDate!.getTime() > now - 10000
      ).toBeTruthy()
    })
  })

  describe('increment', () => {
    interface Post {
      text: string
      likes: number
    }

    const db = schema(($) => ({
      posts: $.collection<Post>()
    }))

    it('allows to increment values', async () => {
      const postRef = await db.posts.add(($) => ({
        text: 'Hello, world!',
        likes: $.increment(2)
      }))
      const post = await postRef.get()
      expect(post?.data.likes).toBe(2)
    })
  })

  describe('arrays', () => {
    interface Post {
      text: string
      likeIds: string[]
    }

    const db = schema(($) => ({
      posts: $.collection<Post>()
    }))

    it('allows to union arrays', async () => {
      const postRef = await db.posts.add(($) => ({
        text: 'Hello, world!',
        likeIds: $.arrayUnion(['like-id', 'another-like-id'])
      }))

      const post = await postRef.get()
      expect(post?.data.likeIds).toEqual(['like-id', 'another-like-id'])
    })

    it('allows to add single items', async () => {
      const postRef = await db.posts.add(($) => ({
        text: 'Hello, world!',
        likeIds: $.arrayUnion('like-id')
      }))

      const post = await postRef.get()
      expect(post?.data.likeIds).toEqual(['like-id'])
    })

    it('allows to remove arrays', async () => {
      const postRef = await db.posts.add(($) => ({
        text: 'Hello, world!',
        likeIds: $.arrayRemove(['like-id', 'another-like-id'])
      }))

      const post = await postRef.get()
      expect(post?.data.likeIds).toEqual([])
    })

    it('allows to remove single items', async () => {
      const postRef = await db.posts.add(($) => ({
        text: 'Hello, world!',
        likeIds: $.arrayRemove('like-id')
      }))

      const post = await postRef.get()
      expect(post?.data.likeIds).toEqual([])
    })
  })
})
