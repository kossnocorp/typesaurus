import assert from 'assert'
import { getRefPath, id, pathToRef, ref } from '.'
import { collection } from '../collection'

describe('Ref', () => {
  interface User {
    name: string
  }
  const users = collection<User>('users')

  describe('ref', () => {
    it('creates ref object', () => {
      assert.deepEqual(ref(users, '42'), {
        __type__: 'ref',
        id: '42',
        collection: users
      })
    })
  })

  describe('id', () => {
    it('generates random id', async () => {
      const userId = await id()
      assert(typeof userId === 'string')
      assert(userId.length > 10)
    })
  })

  describe('getRefPath', () => {
    it('returns full document path', () => {
      assert(
        getRefPath({
          __type__: 'ref',
          id: '42',
          collection: users
        }) === 'users/42'
      )
    })
  })

  describe('pathToRef', () => {
    it('returns full document path', () => {
      assert.deepEqual(pathToRef('users/42'), {
        __type__: 'ref',
        id: '42',
        collection: users
      })
    })
  })
})
