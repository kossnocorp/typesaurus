import assert from 'assert'
import { nanoid } from 'nanoid'
import get from '../get'
import set from '.'
import { collection } from '../collection'
import { Ref, ref } from '../ref'
import { ServerDate, value } from '../value'

describe('set', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string; date?: Date }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('sets a document', async () => {
    const id = nanoid()
    await set(users, id, { name: 'Sasha' })
    const user = await get(users, id)
    assert.deepEqual(user?.data, { name: 'Sasha' })
  })

  it('overwrites a document', async () => {
    const id = nanoid()
    await set(users, id, { name: 'Sasha' })
    await set(users, id, { name: 'Sasha Koss' })
    const user = await get(users, id)
    assert.deepEqual(user?.data, { name: 'Sasha Koss' })
  })

  it('allows setting to refs', async () => {
    const id = nanoid()
    const userRef = ref(users, id)
    await set(userRef, { name: 'Sasha' })
    const user = await get(users, id)
    assert.deepEqual(user?.data, { name: 'Sasha' })
  })

  it('supports references', async () => {
    const userId = nanoid()
    const postId = nanoid()
    await set(users, userId, { name: 'Sasha' })
    await set(posts, postId, { author: ref(users, userId), text: 'Hello!' })
    const postFromDB = await get(posts, postId)
    const userFromDB =
      postFromDB && (await get(users, postFromDB?.data.author.id))
    assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
  })

  it('supports dates', async () => {
    const date = new Date()
    const userRef = ref(users, '42')
    const postId = nanoid()
    await set(posts, postId, { author: userRef, text: 'Hello!', date })
    const postFromDB = await get(posts, postId)
    assert(postFromDB?.data.date?.getTime() === date.getTime())
  })

  describe('server dates', () => {
    const users = collection<User>('users')

    interface User {
      name: string
      createdAt: ServerDate
      updatedAt?: ServerDate
      birthday: Date
    }

    it('supports server dates', async () => {
      const userId = nanoid()
      await set(users, userId, {
        name: 'Sasha',
        createdAt: value('serverDate'),
        updatedAt: value('serverDate'),
        birthday: new Date(1987, 1, 11)
      })
      const user = await get(users, userId)
      const now = Date.now()
      const returnedDate = user?.data.createdAt
      assert(returnedDate !== undefined)
      assert(returnedDate instanceof Date)
      assert(
        returnedDate!.getTime() < now && returnedDate!.getTime() > now - 10000
      )
    })
  })
})
