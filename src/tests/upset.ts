import { schema, Typesaurus } from '..'

describe('upset', () => {
  interface User {
    name: string
    deleted?: boolean
  }

  interface Post {
    author: Typesaurus.Ref<User>
    text: string
    date?: Typesaurus.ServerDate
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    posts: $.collection<Post>()
  }))

  const defaultUser: User = {
    name: 'Sasha'
  }

  it('creates a document if it does not exist', async () => {
    const id = await db.id()
    const initialUser = await db.users.get(id)
    expect(initialUser).toBeNull()
    await db.users.upset(id, { name: 'Sasha' })
    const user = await db.users.get(id)
    expect(user?.data).toEqual({ name: 'Sasha' })
  })

  it('merges data if the document does exits', async () => {
    const id = await db.id()
    await db.users.set(id, defaultUser)
    await db.users.update(id, { deleted: true })
    await db.users.upset(id, { name: 'Sasha Koss' })
    const user = await db.users.get(id)
    expect(user?.data).toEqual({
      name: 'Sasha Koss',
      deleted: true
    })
  })

  it('allows setting to refs', async () => {
    const id = await db.id()
    const userRef = db.users.ref(id)
    await userRef.upset({ name: 'Sasha' })
    const user = await db.users.get(id)
    expect(user?.data).toEqual({ name: 'Sasha' })
  })

  it('allows setting to doc', async () => {
    const id = await db.id()
    await db.users.set(id, defaultUser)
    const user = await db.users.get(id)
    if (!user) throw new Error('Document is not found')
    await user.upset({ name: 'Sasha Koss' })
    const updatedUser = await user.get()
    expect(updatedUser?.data).toEqual({
      name: 'Sasha Koss'
    })
  })

  it('supports references', async () => {
    const userId = await db.id()
    const postId = await db.id()
    await db.users.upset(userId, { name: 'Sasha' })
    await db.posts.upset(postId, {
      author: db.users.ref(userId),
      text: 'Hello!'
    })
    const postFromDB = await db.posts.get(postId)
    const userFromDB = postFromDB && (await postFromDB.data.author.get())
    expect(userFromDB?.data).toEqual({ name: 'Sasha' })
  })

  if (typeof window === 'undefined') {
    it('supports dates', async () => {
      const date = new Date()
      const userRef = db.users.ref('42')
      const postId = await db.id()
      await db.posts.upset(
        postId,
        {
          author: userRef,
          text: 'Hello!',
          date
        },
        { as: 'server' }
      )
      const postFromDB = await db.posts.get(postId)
      expect(postFromDB?.data.date?.getTime()).toBe(date.getTime())
    })
  }

  it('supports server dates', async () => {
    const userRef = db.users.ref('42')
    const postId = await db.id()
    await db.posts.upset(postId, ($) => ({
      author: userRef,
      text: 'Hello!',
      date: $.serverDate()
    }))
    const now = Date.now()
    const post = await db.posts.get(postId)
    const returnedDate = post?.data.date
    expect(returnedDate).toBeInstanceOf(Date)
    expect(
      returnedDate!.getTime() <= now && returnedDate!.getTime() > now - 10000
    ).toBe(true)
    const postFromDB = post && (await post.ref.get())
    const dateFromDB = postFromDB?.data.date
    expect(dateFromDB).toBeInstanceOf(Date)
    expect(
      dateFromDB!.getTime() <= now && dateFromDB!.getTime() > now - 10000
    ).toBe(true)
  })

  it('allows incrementing values', async () => {
    interface Counter {
      count: number
      flagged?: boolean
    }

    const db = schema(($) => ({
      counters: $.collection<Counter>()
    }))

    const id = await db.id()
    await db.counters.upset(id, ($) => ({
      count: $.increment(5)
    }))
    const counter5 = await db.counters.get(id)
    expect(counter5?.data.count).toBe(5)
    await db.counters.update(id, { flagged: true })
    await db.counters.upset(id, ($) => ({
      count: $.increment(5)
    }))
    const counter10 = await db.counters.get(id)
    expect(counter10?.data.count).toBe(10)
    expect(counter10?.data.flagged).toBe(true)
  })

  describe('updating arrays', () => {
    interface Favorite {
      favorites: string[]
    }

    const db = schema(($) => ({
      favorites: $.collection<Favorite>()
    }))

    it('union update', async () => {
      const id = await db.id()
      await db.favorites.upset(id, {
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      await db.favorites.upset(id, ($) => ({
        favorites: $.arrayUnion([
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets'
        ])
      }))
      const favFromDB = await db.favorites.get(id)
      expect(favFromDB?.data).toEqual({
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test',
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets'
        ]
      })
    })

    it('remove update', async () => {
      const id = await db.id()
      await db.favorites.upset(id, {
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      await db.favorites.upset(id, ($) => ({
        favorites: $.arrayRemove([
          'The 22 Immutable Laws of Marketing',
          'Sapiens'
        ])
      }))
      const favFromDB = await db.favorites.get(id)
      expect(favFromDB?.data).toEqual({
        favorites: ['The Mom Test']
      })
    })
  })
})
