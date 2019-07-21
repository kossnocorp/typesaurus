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

  it('returns nothing if document is not present', done => {
    const off = onGet(collection('nope'), 'nah', nothing => {
      assert(nothing === undefined)
      off()
      done()
    })
  })

  it('allows to get by ref', async done => {
    const user = await add(users, { name: 'Sasha' })
    const off = onGet(user.ref, userFromDB => {
      assert.deepEqual(userFromDB.data, { name: 'Sasha' })
      off()
      done()
    })
  })

  it('expands references', async done => {
    const user = await add(users, { name: 'Sasha' })
    const post = await add(posts, {
      author: user.ref,
      text: 'Hello!'
    })
    const off = onGet(posts, post.ref.id, async postFromDB => {
      assert(postFromDB.data.author.__type__ === 'ref')
      const userFromDB = await get(users, postFromDB.data.author.id)
      assert.deepEqual(userFromDB.data, { name: 'Sasha' })
      off()
      done()
    })
  })

  it('expands dates', async done => {
    const date = new Date()
    const userRef = ref(users, '42')
    const post = await add(posts, {
      author: userRef,
      text: 'Hello!',
      date
    })
    const off = onGet(posts, post.ref.id, postFromDB => {
      assert(postFromDB.data.date.getTime() === date.getTime())
      off()
      done()
    })
  })

  describe('real-time', () => {
    it('subscribes to updates', async done => {
      const spy = sinon.spy()
      const user = await add(users, { name: 'Sasha' })
      const off = onGet(user.ref, async doc => {
        const { name } = doc.data
        spy(name)
        if (name === 'Sasha') {
          await update(user.ref, { name: 'Sasha Koss' })
        } else if (name === 'Sasha Koss') {
          off()
          assert(spy.calledWith('Sasha'))
          assert(spy.calledWith('Sasha Koss'))
          done()
        }
      })
    })

    it('returns function that unsubscribes from the updates', async done => {
      let off: () => void
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
            done()
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
})
