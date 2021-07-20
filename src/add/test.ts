import assert from 'assert'
import { add } from '.'
import { collection } from '../collection'
import { get } from '../get'
import { Ref, ref } from '../ref'
import { ServerDate } from '../types'
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
    assert.deepEqual(userFromDB?.data, data)
  })

  it('supports references', async () => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user,
      text: 'Hello!'
    })
    const postFromDB = await get(posts, post.id)
    const userFromDB =
      postFromDB && (await get(users, postFromDB.data.author.id))
    assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
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
    assert(postFromDB?.data.date instanceof Date)
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
      const userRef = ref(users, '42')
      const postRef = await add(users, {
        name: 'Sasha',
        createdAt: value('serverDate'),
        updatedAt: value('serverDate'),
        birthday: new Date(1987, 1, 11)
      })
      const user = await get(postRef)
      const now = Date.now()
      const returnedDate = user?.data.createdAt
      assert(returnedDate !== undefined)
      assert(returnedDate instanceof Date)
      assert(
        returnedDate!.getTime() < now && returnedDate!.getTime() > now - 10000
      )
    })

    it('allows to assert environment which allows setting dates', async () => {
      // TODO: Find a way to make the error show on fields like when assertEnvironment: 'web'
      await add(users, {
        name: 'Sasha',
        // @ts-expect-error
        createdAt: new Date(),
        // @ts-expect-error
        updatedAt: new Date(),
        birthday: new Date(1987, 1, 11)
      })

      const nodeAdd = () =>
        add(
          users,
          {
            name: 'Sasha',
            createdAt: new Date(),
            updatedAt: new Date(),
            birthday: new Date(1987, 1, 11)
          },
          { assertEnvironment: 'node' }
        )

      const webAdd = () =>
        add(
          users,
          {
            name: 'Sasha',
            // @ts-expect-error
            createdAt: new Date(),
            // @ts-expect-error
            updatedAt: new Date(),
            birthday: new Date(1987, 1, 11)
          },
          { assertEnvironment: 'web' }
        )

      if (typeof window === 'undefined') {
        await nodeAdd()
        try {
          await webAdd()
          assert.fail('It should catch!')
        } catch (err) {
          assert(err.message === 'Expected web environment')
        }
      } else {
        await webAdd()
        try {
          await nodeAdd()
          assert.fail('It should catch!')
        } catch (err) {
          assert(err.message === 'Expected node environment')
        }
      }
    })
  })
})
