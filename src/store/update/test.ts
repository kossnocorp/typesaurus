import assert from 'assert'
import store from '../..'
import { collection } from '../../collection'
import field from '../../field'
import update from '.'

describe('update', () => {
  type User = { name: string; address: { city: string } }
  const users = collection<User>('users')

  it('updates document', async () => {
    const user = await store.add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' }
    })
    const { id } = user.ref
    await update(users, id, { name: 'Sasha Koss' })
    const userFromDB = await store.get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha Koss',
      address: { city: 'Omsk' }
    })
  })

  it('allows update nested maps', async () => {
    const user = await store.add(users, {
      name: 'Sasha',
      address: { city: 'Omsk' }
    })
    const { id } = user.ref
    await update(users, id, [
      field('name', 'Sasha Koss'),
      field(['address', 'city'], 'Dimitrovgrad')
    ])
    const userFromDB = await store.get(users, id)
    assert.deepEqual(userFromDB.data, {
      name: 'Sasha Koss',
      address: { city: 'Dimitrovgrad' }
    })
  })
})
