import assert from 'assert'
import nanoid from 'nanoid'
import get from '../get'
import set from '.'
import { collection } from '../collection'
import { Ref, ref } from '../ref'

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
})
