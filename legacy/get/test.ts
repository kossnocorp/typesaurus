import assert from 'assert'
import { get } from '.'
import { add } from '../add'
import { collection } from '../collection'
import { Ref, ref } from '../ref'

describe('get', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string; date?: Date }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('returns nothing if document is not present', async () => {
    const nothing = await get(collection('nope'), 'nah')
    assert(nothing === null)
  })

  it('allows to get by ref', async () => {
    const user = await add(users, { name: 'Sasha' })
    const userFromDB = await get(user)
    assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
  })

  it('expands references', async () => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user,
      text: 'Hello!'
    })
    const postFromDB = await get(posts, post.id)
    assert(postFromDB?.data.author.__type__ === 'ref')
    const userFromDB =
      postFromDB && (await get(users, postFromDB.data.author.id))
    assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
  })

  it('expands dates', async () => {
    const date = new Date()
    const userRef = ref(users, '42')
    const post = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date
    })
    const postFromDB = await get(posts, post.id)
    assert(postFromDB?.data.date?.getTime() === date.getTime())
  })
})
