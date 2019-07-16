import assert from 'assert'
import add from '.'
import { collection } from '../collection'
import get from '../get'
import { Ref } from '../ref'

describe('add', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('adds document to collection', async () => {
    const data = { name: 'Sasha' }
    const user = await add(users, data)
    const { id } = user.ref
    assert(typeof id === 'string')
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, data)
  })

  it('supports references', async () => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user.ref,
      text: 'Hello!'
    })
    const postFromDB = await get(posts, post.ref.id)
    const userFromDB = await get(users, postFromDB.data.author.id)
    assert.deepEqual(userFromDB.data, { name: 'Sasha' })
  })
})
