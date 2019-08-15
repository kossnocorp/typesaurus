import assert from 'assert'
import nanoid from 'nanoid'
import update from '.'
import add from '../add'
import { collection } from '../collection'
import field from '../field'
import get from '../get'
import { Ref } from '../ref'
import set from '../set'
import { value } from '../value'

describe('update', () => {
  type User = {
    name: string
    address: { city: string }
    visits: number
    guest?: boolean
    birthday?: Date
  }
  type Post = { author: Ref<User>; text: string }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('updates document', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    const { id } = user.ref
    await update(users, id, { name: 'Sasha Koss' })
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha Koss',
      address: { city: 'Omsk' }
    })
  })

  it('allows updating refs', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    await update(user.ref, { name: 'Sasha Koss' })
    await update(user.ref, [
      field('name', 'Sasha Koss'),
      field(['address', 'city'], 'Moscow')
    ])
    const userFromDB = await get(users, user.ref.id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha Koss',
      address: { city: 'Moscow' }
    })
  })

  it('allows update nested maps', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    const { id } = user.ref
    await update(users, id, [
      field('name', 'Sasha Koss'),
      field(['address', 'city'], 'Dimitrovgrad'),
      field('visits', value('increment', 1))
    ])
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha Koss',
      address: { city: 'Dimitrovgrad' },
      visits: 1
    })
  })

  it('supports references', async () => {
    const userId1 = nanoid()
    const userId2 = nanoid()
    const user1 = await set(users, userId1, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    const user2 = await set(users, userId2, {
      name: 'Tati',
      address: { city: 'Dimitrovgrad' },
      visits: 0
    })
    const postId = nanoid()
    const post = await set(posts, postId, {
      author: user1.ref,
      text: 'Hello!'
    })
    await update(posts, post.ref.id, { author: user2.ref })
    const postFromDB = await get(posts, postId)
    const userFromDB = await get(users, postFromDB.data.author.id)
    assert(userFromDB.data.name === 'Tati')
  })

  it('allows clearing values', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0,
      guest: true
    })
    const { id } = user.ref
    await update(users, id, { guest: value('clear') })
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha',
      address: { city: 'Omsk' }
    })
  })

  it('allows incrementing values', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 0
    })
    const { id } = user.ref
    await update(users, id, { visits: value('increment', 2) })
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      visits: 2
    })
  })

  it('supports dates', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 2, 11),
      visits: 0
    })
    const { id } = user.ref
    await update(users, id, { birthday: new Date(1987, 1, 11) })
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 1, 11)
    })
  })

  it('supports server dates', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' },
      birthday: new Date(1987, 2, 11),
      visits: 0
    })
    const { id } = user.ref
    await update(users, id, { birthday: value('serverDate') })
    const userFromDB = await get(users, id)
    const dateFromDB = userFromDB.data.birthday
    const now = Date.now()
    assert(dateFromDB instanceof Date)
    assert(dateFromDB.getTime() < now && dateFromDB.getTime() > now - 10000)
  })

  describe('updating arrays', () => {
    type Favorite = { userId: string; favorites: string[] }
    const favorites = collection<Favorite>('favorites')

    it('union update', async () => {
      const userId = nanoid()
      const fav = await add(favorites, {
        userId,
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      const { id } = fav.ref
      await update(favorites, id, {
        favorites: value('arrayUnion', [
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets'
        ])
      })
      const favFromDB = await get(favorites, id)
      assert.deepEqual(favFromDB.data, {
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
      const userId = nanoid()
      const fav = await add(favorites, {
        userId,
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      const { id } = fav.ref
      await update(favorites, id, {
        favorites: value('arrayRemove', [
          'The 22 Immutable Laws of Marketing',
          'Sapiens'
        ])
      })
      const favFromDB = await get(favorites, id)
      assert.deepEqual(favFromDB.data, {
        userId,
        favorites: ['The Mom Test']
      })
    })
  })
})
