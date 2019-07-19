import get from '../get'
import add from '../add'
import clear from '.'
import assert from 'assert'
import { collection } from '../collection'

describe('clear', () => {
  type User = { name: string }
  const users = collection<User>('users')

  it('removes document', async () => {
    const user = await add(users, { name: 'Sasha' })
    const { id } = user.ref
    await clear(users, id)
    const userFromDB = await get(users, id)
    assert(userFromDB === undefined)
  })

  it('allows removing by ref', async () => {
    const user = await add(users, { name: 'Sasha' })
    await clear(user.ref)
    const userFromDB = await get(users, user.ref.id)
    assert(userFromDB === undefined)
  })
})
