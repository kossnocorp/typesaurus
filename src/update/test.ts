import assert from 'assert'
import nanoid from 'nanoid'
import update from '.'
import add from '../add'
import { collection } from '../collection'
import field from '../field'
import get from '../get'
import { Ref } from '../ref'
import set from '../set'
import value from '../value'

describe('update', () => {
  type User = {
    name: string
    address: { city: string }
    guest?: boolean
    visits?: number
  }
  type Post = { author: Ref<User>; text: string }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  it('updates document', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' }
    })
    const { id } = user.ref
    await update(users, id, { name: 'Sasha Koss' })
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha Koss',
      address: { city: 'Omsk' }
    })
  })

  it('allows update nested maps', async () => {
    const user = await add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' }
    })
    const { id } = user.ref
    await update(users, id, [
      field('name', 'Sasha Koss'),
      field(['address', 'city'], 'Dimitrovgrad')
    ])
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha Koss',
      address: { city: 'Dimitrovgrad' }
    })
  })

  it('supports references', async () => {
    const userId1 = nanoid()
    const userId2 = nanoid()
    const user1 = await set(users, userId1, {
      name: 'Sasha',
      address: { city: 'Omsk' }
    })
    const user2 = await set(users, userId2, {
      name: 'Tati',
      address: { city: 'Dimitrovgrad' }
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
      address: { city: 'Omsk' }
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
})
