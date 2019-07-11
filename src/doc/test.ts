import assert from 'assert'
import nanoid from 'nanoid'
import { doc } from '.'
import { collection } from '../collection'
import { ref } from '../ref'

describe('Doc', () => {
  const users = collection<User>('users')

  describe('doc', () => {
    it('creates doc object', () => {
      const userRef = ref(users, nanoid())
      assert.deepEqual(doc(userRef, { name: 'Sasha' }), {
        __type__: 'doc',
        ref: userRef,
        data: { name: 'Sasha' }
      })
    })
  })
})

interface User {
  name: string
}
