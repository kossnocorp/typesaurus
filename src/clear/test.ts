import store from '..'
import clear from '.'
import assert from 'assert'
import { collection } from '../collection'

describe('clear', () => {
  type User = { name: string }
  const users = collection<User>('users')

  it('removes document', async () => {
    const user = await store.add(users, { name: 'Sasha' })
    const { id } = user.ref
    await clear(users, id)
    const userFromDB = await store.get(users, id)
    assert(userFromDB === undefined)
  })
})
