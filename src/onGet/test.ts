import assert from 'assert'
import onGet from '.'
import get from '../get'
import { collection } from '../collection'
import { Ref, ref } from '../ref'
import add from '../add'
import update from '../update'
import sinon from 'sinon'

describe('get', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string; date?: Date }

  const users = collection<User>('users')
  const posts = collection<Post>('post')

  let off: (() => void) | undefined

  afterEach(() => {
    off && off()
    off = undefined
  })

  it('returns nothing if document is not present', done => {
    off = onGet(collection('nope'), 'nah', nothing => {
      assert(nothing === null)
      done()
    })
  })

  it('allows to get by ref', async () => {
    const user = await add(users, { name: 'Sasha' })
    return new Promise(resolve => {
      off = onGet(user.ref, userFromDB => {
        assert.deepEqual(userFromDB.data, { name: 'Sasha' })
        resolve()
      })
    })
  })

  it('expands references', async () => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user.ref,
      text: 'Hello!'
    })
    return new Promise(resolve => {
      off = onGet(posts, post.ref.id, async postFromDB => {
        assert(postFromDB.data.author.__type__ === 'ref')
        const userFromDB = await get(users, postFromDB.data.author.id)
        assert.deepEqual(userFromDB.data, { name: 'Sasha' })
        resolve()
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
    return new Promise(resolve => {
      off = onGet(posts, post.ref.id, postFromDB => {
        assert(postFromDB.data.date.getTime() === date.getTime())
        resolve()
      })
    })
  })

  describe('real-time', () => {
    it('subscribes to updates', async () => {
      const spy = sinon.spy()
      const user = await add(users, { name: 'Sasha' })
      return new Promise(resolve => {
        off = onGet(user.ref, async doc => {
          const { name } = doc.data
          spy(name)
          if (name === 'Sasha') {
            await update(user.ref, { name: 'Sasha Koss' })
          } else if (name === 'Sasha Koss') {
            assert(spy.calledWith('Sasha'))
            assert(spy.calledWith('Sasha Koss'))
            resolve()
          }
        })
      })
    })

    // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
    if (typeof window === undefined) {
      it('returns function that unsubscribes from the updates', () => {
        return new Promise(async resolve => {
          const spy = sinon.spy()
          const user = await add(users, { name: 'Sasha' })
          const on = () => {
            off = onGet(user.ref, doc => {
              const { name } = doc.data
              spy(name)
              if (name === 'Sasha Koss') {
                off()
                assert(spy.neverCalledWith('Sashka'))
                assert(spy.calledWith('Sasha Koss'))
                resolve()
              }
            })
          }
          on()
          off()
          await update(user.ref, { name: 'Sashka' })
          await update(user.ref, { name: 'Sasha Koss' })
          on()
        })
      })
    }
  })
})
