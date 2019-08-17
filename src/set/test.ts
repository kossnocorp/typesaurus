import assert from 'assert'
import nanoid from 'nanoid'
import get from '../get'
import set from '.'
import { collection } from '../collection'
import { Ref, ref } from '../ref'
import { value } from '../value'

describe('set', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string; date?: Date }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('sets a document', async () => {
    const id = nanoid()
    await set(users, id, { name: 'Sasha' })
    const user = await get(users, id)
    assert.deepEqual(user.data, { name: 'Sasha' })
  })

  it('returns doc', async () => {
    const id = nanoid()
    const data = { name: 'Sasha' }
    const user = await set(users, id, data)
    assert.deepEqual(user, {
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id },
      data
    })
  })

  it('overwrites a document', async () => {
    const id = nanoid()
    await set(users, id, { name: 'Sasha' })
    await set(users, id, { name: 'Sasha Koss' })
    const user = await get(users, id)
    assert.deepEqual(user.data, { name: 'Sasha Koss' })
  })

  it('allows to merge', async () => {
    const id = nanoid()
    const date = new Date()
    const author = await set(users, `user-${id}`, { name: 'Sasha' })
    const postId = `post-${id}`
    const postPayload = {
      author: author.ref,
      text: 'Hello!'
    }
    await set(posts, postId, Object.assign({ date }, postPayload))
    await set(posts, postId, postPayload, { merge: true })
    const postFromDB = await get(posts, postId)
    assert.deepEqual(postFromDB.data, {
      date,
      author: author.ref,
      text: 'Hello!'
    })
  })

  it('allows setting to refs', async () => {
    const id = nanoid()
    const userRef = ref(users, id)
    await set(userRef, { name: 'Sasha' })
    const user = await get(users, id)
    assert.deepEqual(user.data, { name: 'Sasha' })
  })

  it('supports references', async () => {
    const userId = nanoid()
    const postId = nanoid()
    const user = await set(users, userId, { name: 'Sasha' })
    const post = await set(posts, postId, {
      author: user.ref,
      text: 'Hello!'
    })
    const postFromDB = await get(posts, post.ref.id)
    const userFromDB = await get(users, postFromDB.data.author.id)
    assert.deepEqual(userFromDB.data, { name: 'Sasha' })
  })

  it('supports dates', async () => {
    const date = new Date()
    const userRef = ref(users, '42')
    const postId = nanoid()
    const post = await set(posts, postId, {
      author: userRef,
      text: 'Hello!',
      date
    })
    const postFromDB = await get(posts, post.ref.id)
    assert(postFromDB.data.date.getTime() === date.getTime())
  })

  it('supports server dates', async () => {
    const userRef = ref(users, '42')
    const postId = nanoid()
    const post = await set(posts, postId, {
      author: userRef,
      text: 'Hello!',
      date: value('serverDate')
    })
    const now = Date.now()
    const returnedDate = post.data.date
    assert(returnedDate instanceof Date)
    assert(returnedDate.getTime() < now && returnedDate.getTime() > now - 10000)
    const postFromDB = await get(posts, post.ref.id)
    const dateFromDB = postFromDB.data.date
    assert(dateFromDB instanceof Date)
    assert(dateFromDB.getTime() < now && dateFromDB.getTime() > now - 10000)
  })
})
