import assert from 'assert'
import get from '.'
import { collection } from '../collection'
import { Ref } from '../ref'
import add from '../add'

describe('get', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('returns nothing if document is not present', async () => {
    const nothing = await get(collection('nope'), 'nah')
    assert(nothing === undefined)
  })

  it('expands references', async () => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user.ref,
      text: 'Hello!'
    })
    const postFromDB = await get(posts, post.ref.id)
    assert(postFromDB.data.author.__type__ === 'ref')
    const userFromDB = await get(users, postFromDB.data.author.id)
    assert.deepEqual(userFromDB.data, { name: 'Sasha' })
  })
})
