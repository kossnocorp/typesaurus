import assert from 'assert'
import sinon from 'sinon'
import { onGet } from '.'
import { add } from '../add'
import { collection } from '../collection'
import { get } from '../get'
import { Ref, ref } from '../ref'
import { update } from '../update'

describe('onGet', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string; date?: Date }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  let off: (() => void) | undefined

  afterEach(() => {
    off && off()
    off = undefined
  })

  it('returns nothing if document is not present', (done) => {
    off = onGet(collection('nope'), 'nah', (nothing) => {
      assert(nothing === null)
      done()
    })
  })

  it('allows to get by ref', async () => {
    const user = await add(users, { name: 'Sasha' })
    return new Promise((resolve) => {
      off = onGet(user, (userFromDB) => {
        assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
        resolve(void 0)
      })
    })
  })

  it('expands references', async () => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user,
      text: 'Hello!'
    })
    return new Promise((resolve) => {
      off = onGet(posts, post.id, async (postFromDB) => {
        assert(postFromDB?.data.author.__type__ === 'ref')
        const userFromDB =
          postFromDB && (await get(users, postFromDB.data.author.id))
        assert.deepEqual(userFromDB?.data, { name: 'Sasha' })
        resolve(void 0)
      })
    })
  })

  it('expands dates', async () => {
    const date = new Date()
    const userRef = ref(users, '42')
    const post = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date
    })
    return new Promise((resolve) => {
      off = onGet(posts, post.id, (postFromDB) => {
        assert(postFromDB?.data.date?.getTime() === date.getTime())
        resolve(void 0)
      })
    })
  })

  describe('real-time', () => {
    it('subscribes to updates', async () => {
      const spy = sinon.spy()
      const user = await add(users, { name: 'Sasha' })
      return new Promise((resolve) => {
        off = onGet(user, async (doc) => {
          const name = doc?.data.name
          spy(name)
          if (name === 'Sasha') {
            await update(user, { name: 'Sasha Koss' })
          } else if (name === 'Sasha Koss') {
            assert(spy.calledWith('Sasha'))
            assert(spy.calledWith('Sasha Koss'))
            resolve(void 0)
          }
        })
      })
    })

    // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
    if (typeof window === undefined) {
      it('returns function that unsubscribes from the updates', () => {
        return new Promise(async (resolve) => {
          const spy = sinon.spy()
          const user = await add(users, { name: 'Sasha' })
          const on = () => {
            off = onGet(user, (doc) => {
              const name = doc?.data.name
              spy(name)
              if (name === 'Sasha Koss') {
                off?.()
                assert(spy.neverCalledWith('Sashka'))
                assert(spy.calledWith('Sasha Koss'))
                resolve(void 0)
              }
            })
          }
          on()
          off?.()
          await update(user, { name: 'Sashka' })
          await update(user, { name: 'Sasha Koss' })
          on()
        })
      })
    }
  })
})
