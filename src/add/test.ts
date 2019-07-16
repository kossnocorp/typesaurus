import assert from 'assert'
import add from '.'
import { collection } from '../collection'
import get from '../get'

describe('add', () => {
  type User = { name: string }
  const users = collection<User>('users')

  it('adds document to collection', async () => {
    const data = { name: 'Sasha' }
    const user = await add(users, data)
    const { id } = user.ref
    assert(typeof id === 'string')
    const userFromDB = await get(users, id)
    assert.deepEqual(userFromDB.data, data)
  })
})
