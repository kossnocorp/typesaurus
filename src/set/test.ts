import assert from 'assert'
import nanoid from 'nanoid'
import get from '../get'
import set from '.'
import { collection } from '../collection'

describe('set', () => {
  type User = { name: string }
  const users = collection<User>('users')

  it('sets a document', async () => {
    const id = nanoid()
    await set(users, id, { name: 'Sasha' })
    const user = await get(users, id)
    assert.deepEqual(user.data, { name: 'Sasha' })
  })

  it('returns doc', async () => {
    const id = nanoid()
    const data = { name: 'Sasha' }
    const user = await set(users, id, data)
    assert.deepEqual(user, {
      __type__: 'doc',
      ref: { __type__: 'ref', collection: users, id },
      data
    })
  })

  it('overwrites a document', async () => {
    const id = nanoid()
    await set(users, id, { name: 'Sasha' })
    await set(users, id, { name: 'Sasha Koss' })
    const user = await get(users, id)
    assert.deepEqual(user.data, { name: 'Sasha Koss' })
  })
})
