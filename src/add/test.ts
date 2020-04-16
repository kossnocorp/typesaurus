import assert from 'assert'
import add from '.'
import { collection } from '../collection'
import get from '../get'
import { Ref, ref } from '../ref'
import { value } from '../value'

describe('add', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string; date?: Date }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('adds document to collection', async () => {
    const data = { name: 'Sasha' }
    const user = await add(users, data)
    const { id } = user
    assert(typeof id === 'string')
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, data)
  })

  it('supports references', async () => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user,
      text: 'Hello!'
    })
    const postFromDB = await get(posts, post.id)
    const userFromDB = await get(users, postFromDB.data.author.id)
    assert.deepEqual(userFromDB.data, { name: 'Sasha' })
  })

  it('supports dates', async () => {
    const userRef = ref(users, '42')
    const date = new Date()
    const post = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date
    })
    const postFromDB = await get(posts, post.id)
    assert(postFromDB.data.date instanceof Date)
    assert(postFromDB.data.date.getTime() === date.getTime())
  })

  it('supports server dates', async () => {
    const userRef = ref(users, '42')
    const postRef = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date: value('serverDate')
    })
    const post = await get(postRef)
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
