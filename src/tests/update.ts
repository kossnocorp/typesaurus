import { Typesaurus, schema } from '..'

describe('update', () => {
  interface User {
    name: string
    address: { city: string }
    visits: number
    guest?: boolean
    birthday?: Date
  }

  interface Post {
    author: Typesaurus.Ref<User>
    text: string
  }

  interface Favorite {
    userId: string
    favorites: string[]
  }

  interface Movies {
    title: string
    likedBy: Typesaurus.Ref<User>[]
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    posts: $.collection<Post>(),
    favorites: $.collection<Favorite>(),
    movies: $.collection<Movies>()
  }))

  it('updates document', async () => {
    const user = await db.users.add({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    const { id } = user
    await db.users.update(id, { name: 'Sasha Koss' })
    const userFromDB = await db.users.get(id)
    expect(userFromDB?.data).toEqual({
      name: 'Sasha Koss',
      address: { city: 'Omsk' },
      visits: 0
    })
  })

  it('allows updating via refs', async () => {
    const user = await db.users.add({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    await user.update({ name: 'Sasha Koss' })
    await user.update(($) => [
      $.field('name', 'Sasha Koss'),
      $.field('address', 'city', 'Moscow')
    ])
    const userFromDB = await db.users.get(user.id)
    expect(userFromDB?.data).toEqual({
      name: 'Sasha Koss',
      address: { city: 'Moscow' },
      visits: 0
    })
  })

  it('allows update nested maps', async () => {
    const user = await db.users.add({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    const { id } = user
    await db.users.update(id, ($) => [
      $.field('name', 'Sasha Koss'),
      $.field('address', 'city', 'Dimitrovgrad'),
      $.field('visits', $.increment(1))
    ])
    const userFromDB = await user.get()
    expect(userFromDB?.data).toEqual({
      name: 'Sasha Koss',
      address: { city: 'Dimitrovgrad' },
      visits: 1
    })
  })

  it('supports references', async () => {
    const userId1 = await db.id()
    const userId2 = await db.id()
    await db.users.set(userId1, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    await db.users.set(userId2, {
      name: 'Tati',
      address: { city: 'Dimitrovgrad' },
      visits: 0
    })
    const postId = await db.id()
    await db.posts.set(postId, {
      author: db.users.ref(userId1),
      text: 'Hello!'
    })
    await db.posts.update(postId, { author: db.users.ref(userId2) })
    const postFromDB = await db.posts.get(postId)
    const userFromDB = postFromDB && (await postFromDB.data.author.get())
    expect(userFromDB?.data.name).toBe('Tati')
  })

  it('allows removing values', async () => {
    const user = await db.users.add({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
      guest: true
    })
    const { id } = user
    await db.users.update(id, ($) => ({ guest: $.remove() }))
    const userFromDB = await db.users.get(id)
    expect(userFromDB?.data).toEqual({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
  })

  it('allows incrementing values', async () => {
    const user = await db.users.add({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    const { id } = user
    await db.users.update(id, ($) => ({ visits: $.increment(2) }))
    const userFromDB = await db.users.get(id)
    expect(userFromDB?.data).toEqual({
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 2
    })
  })

  it('supports dates', async () => {
    const user = await db.users.add({
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 2, 11),
      visits: 0
    })
    const { id } = user
    await db.users.update(id, { birthday: new Date(1987, 1, 11) })
    const userFromDB = await db.users.get(id)
    expect(userFromDB?.data).toEqual({
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 1, 11),
      visits: 0
    })
  })

  it('supports server dates', async () => {
    const user = await db.users.add({
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 2, 11),
      visits: 0
    })
    const { id } = user
    await db.users.update(id, ($) => ({ birthday: $.serverDate() }))
    const userFromDB = await db.users.get(id)
    const dateFromDB = userFromDB?.data.birthday
    const now = Date.now()
    expect(dateFromDB).toBeInstanceOf(Date)
    expect(
      dateFromDB!.getTime() < now && dateFromDB!.getTime() > now - 10000
    ).toBe(true)
  })

  describe('updating arrays', () => {
    it('union update', async () => {
      const userId = await db.id()
      const fav = await db.favorites.add({
        userId,
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      const { id } = fav
      await db.favorites.update(id, ($) => ({
        favorites: $.arrayUnion([
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets'
        ])
      }))
      const favFromDB = await db.favorites.get(id)
      expect(favFromDB?.data).toEqual({
        userId,
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
      const userId = await db.id()
      const fav = await db.favorites.add({
        userId,
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      const { id } = fav
      await db.favorites.update(id, ($) => ({
        favorites: $.arrayRemove([
          'The 22 Immutable Laws of Marketing',
          'Sapiens'
        ])
      }))
      const favFromDB = await db.favorites.get(id)
      expect(favFromDB?.data).toEqual({
        userId,
        favorites: ['The Mom Test']
      })
    })

    it('union update references', async () => {
      const user1 = db.users.ref(await db.id())
      const user2 = db.users.ref(await db.id())
      const movie = await db.movies.add({
        title: "Harry Potter and the Sorcerer's Stone",
        likedBy: [user1]
      })

      await movie.update(($) => ({
        likedBy: $.arrayUnion([user2])
      }))
      const movieFromDB = await movie.get()
      expect(movieFromDB?.data).toEqual({
        title: "Harry Potter and the Sorcerer's Stone",
        likedBy: [user1, user2]
      })
    })

    it('remove update references', async () => {
      const user1 = db.users.ref(await db.id())
      const user2 = db.users.ref(await db.id())
      const movie = await db.movies.add({
        title: 'Harry Potter and the Chamber of Secrets',
        likedBy: [user1, user2]
      })

      await movie.update(($) => ({
        likedBy: $.arrayRemove([user2])
      }))
      const bookFromDB = await movie.get()
      expect(bookFromDB?.data).toEqual({
        title: 'Harry Potter and the Chamber of Secrets',
        likedBy: [user1]
      })
    })
  })
})
