import assert from 'assert'
import { collection } from '.'

describe('Collection', () => {
  describe('collection', () => {
    it('creates collection object', () => {
      assert.deepEqual(collection<User>('users'), {
        __type__: 'collection',
        path: 'users'
      })
    })
  })
})

interface User {}
