import assert from 'assert'
import exists from '.'
import { collection } from '../collection'
import { ref } from '../ref'
import add from '../add'
import set from '../set'

describe('exists', () => {
  type User = { name: string }

  const users = collection<User>('users')

  describe('by ref', () => {
    it('returns false if document is not present', async () => {
      assert((await exists(ref(users, 'not present'))) === false)
    })

    it('returns true if document is present', async () => {
      const user = await add(users, { name: 'Ludwig' })
      assert((await exists(user)) === true)
    })
  })

  describe('by collection and id', () => {
    it('returns false if document is not present', async () => {
      assert((await exists(collection('nope'), 'nah')) === false)
    })

    it('returns true if document is present', async () => {
      const user = await set(users, '123', { name: 'Ludwig' })
      assert((await exists(users, '123')) === true)
    })
  })
})
