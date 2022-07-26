import { describe, beforeEach, expect, it } from 'vitest'
import { Typesaurus } from '..'
import { schema } from '../adaptor/admin'

describe('get', () => {
  interface User {
    name: string
  }

  interface Post {
    author: Typesaurus.Ref<User>
    text: string
    date?: Date
  }

  interface Nope {}

  const db = schema(($) => ({
    users: $.collection<User>(),
    posts: $.collection<Post>(),
    nope: $.collection<Nope>()
  }))

  it('returns nothing if document is not present', async () => {
    const nothing = await db.nope.get('nah')
    expect(nothing).toBe(null)
  })

  // it('allows to get via ref', async () => {
  //   const user = await db.users.add({ name: 'Sasha' })
  //   const userFromDB = await user.get(user)
  //   expect(userFromDB?.data).toEqual({ name: 'Sasha' })
  // })

  // it('expands references', async () => {
  //   const user = await add(users, { name: 'Sasha' })
  //   const post = await add(posts, {
  //     author: user,
  //     text: 'Hello!'
  //   })
  //   const postFromDB = await get(posts, post.id)
  //   assert(postFromDB?.data.author.__type__ === 'ref')
  //   const userFromDB =
  //     postFromDB && (await get(users, postFromDB.data.author.id))
  //   assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
  // })

  // it('expands dates', async () => {
  //   const date = new Date()
  //   const userRef = ref(users, '42')
  //   const post = await add(posts, {
  //     author: userRef,
  //     text: 'Hello!',
  //     date
  //   })
  //   const postFromDB = await get(posts, post.id)
  //   assert(postFromDB?.data.date?.getTime() === date.getTime())
  // })
})
