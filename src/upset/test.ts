import assert from 'assert'
import { nanoid } from 'nanoid'
import { upset } from '.'
import { collection } from '../collection'
import { get } from '../get'
import { Ref, ref } from '../ref'
import { set } from '../set'
import { ServerDate } from '../types'
import { update } from '../update'
import { value } from '../value'

describe('merge', () => {
  type User = { name: string; deleted?: boolean }
  type Post = { author: Ref<User>; text: string; date?: ServerDate }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  const defaultUser: User = {
    name: 'Sasha'
  }

  it('creates a document if it does not exist', async () => {
    const id = nanoid()
    const initialUser = await get(users, id)
    assert(initialUser === null)
    await upset(users, id, { name: 'Sasha' })
    const user = await get(users, id)
    assert.deepEqual(user?.data, { name: 'Sasha' })
  })

  it('merges data if the document does exits', async () => {
    const id = nanoid()
    await set(users, id, defaultUser)
    await update(users, id, { deleted: true })
    await upset(users, id, { name: 'Sasha Koss' })
    const user = await get(users, id)
    assert.deepEqual(user?.data, {
      name: 'Sasha Koss',
      deleted: true
    })
  })

  it('allows setting to refs', async () => {
    const id = nanoid()
    const userRef = ref(users, id)
    await upset(userRef, { name: 'Sasha' })
    const user = await get(users, id)
    assert.deepEqual(user?.data, { name: 'Sasha' })
  })

  it('supports references', async () => {
    const userId = nanoid()
    const postId = nanoid()
    await upset(users, userId, { name: 'Sasha' })
    await upset(posts, postId, {
      author: ref(users, userId),
      text: 'Hello!'
    })
    const postFromDB = await get(posts, postId)
    const userFromDB =
      postFromDB && (await get(users, postFromDB.data.author.id))
    assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
  })

  if (typeof window === 'undefined') {
    it('supports dates', async () => {
      const date = new Date()
      const userRef = ref(users, '42')
      const postId = nanoid()
      await upset(
        posts,
        postId,
        {
          author: userRef,
          text: 'Hello!',
          date
        },
        { assertEnvironment: 'node' }
      )
      const postFromDB = await get(posts, postId)
      assert(postFromDB?.data.date?.getTime() === date.getTime())
    })
  }

  it('supports server dates', async () => {
    const userRef = ref(users, '42')
    const postId = nanoid()
    await upset(posts, postId, {
      author: userRef,
      text: 'Hello!',
      date: value('serverDate')
    })
    const now = Date.now()
    const post = await get(posts, postId)
    const returnedDate = post?.data.date
    assert(returnedDate instanceof Date)
    assert(
      returnedDate!.getTime() < now && returnedDate!.getTime() > now - 10000
    )
    const postFromDB = post && (await get(posts, post.ref.id))
    const dateFromDB = postFromDB?.data.date
    assert(dateFromDB instanceof Date)
    assert(dateFromDB!.getTime() < now && dateFromDB!.getTime() > now - 10000)
  })

  it('allows incrementing values', async () => {
    type Counter = { count: number; flagged?: boolean }
    const counters = collection<Counter>('conters')
    const id = nanoid()
    await upset(counters, id, {
      count: value('increment', 5)
    })
    const counter5 = await get(counters, id)
    assert(counter5?.data.count === 5)
    await update(counters, id, { flagged: true })
    await upset(counters, id, {
      count: value('increment', 5)
    })
    const counter10 = await get(counters, id)
    assert(counter10?.data.count === 10)
    assert(counter10?.data.flagged)
  })

  describe('updating arrays', () => {
    type Favorite = { favorites: string[] }
    const favorites = collection<Favorite>('favorites')

    it('union update', async () => {
      const id = nanoid()
      await upset(favorites, id, {
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      await upset(favorites, id, {
        favorites: value('arrayUnion', [
          "Harry Potter and the Sorcerer's Stone",
          'Harry Potter and the Chamber of Secrets'
        ])
      })
      const favFromDB = await get(favorites, id)
      assert.deepEqual(favFromDB?.data, {
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
      const id = nanoid()
      await upset(favorites, id, {
        favorites: [
          'Sapiens',
          'The 22 Immutable Laws of Marketing',
          'The Mom Test'
        ]
      })
      await upset(favorites, id, {
        favorites: value('arrayRemove', [
          'The 22 Immutable Laws of Marketing',
          'Sapiens'
        ])
      })
      const favFromDB = await get(favorites, id)
      assert.deepEqual(favFromDB?.data, {
        favorites: ['The Mom Test']
      })
    })
  })
})
