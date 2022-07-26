import { Typesaurus } from '..'
import { schema } from '../adaptor'

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

  it('allows to get via ref', async () => {
    const userRef = await db.users.add({ name: 'Sasha' })
    const userFromDB = await userRef.get()
    expect(userFromDB?.data).toEqual({ name: 'Sasha' })
  })

  it('expands references', async () => {
    const userRef = await db.users.add({ name: 'Sasha' })
    const postRef = await db.posts.add({
      author: userRef,
      text: 'Hello!'
    })
    const postFromDB = await postRef.get()
    expect(postFromDB?.data.author.type).toBe('ref')
    const userFromDB = postFromDB && (await postFromDB.data.author.get())
    expect(userFromDB?.data).toEqual({ name: 'Sasha' })
  })

  it('expands dates', async () => {
    const date = new Date()
    const userRef = db.users.ref('42')
    const post = await db.posts.add({
      author: userRef,
      text: 'Hello!',
      date
    })
    const postFromDB = await post.get()
    expect(postFromDB?.data.date?.getTime()).toBe(date.getTime())
  })
})
