import { schema } from '..'
import { silence } from './index'

describe('helpers', () => {
  describe('silence', () => {
    interface User {
      name: string
    }

    const db = schema(($) => ({
      users: $.collection<User>()
    }))

    it('allows to silence a promise', async () =>
      silence(db.users.update(await db.users.id(), { name: 'Sasha' })))
  })
})
