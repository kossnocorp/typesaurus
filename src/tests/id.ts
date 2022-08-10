import { schema } from '..'

describe('id', () => {
  it('generates random id', async () => {
    const db = schema(($) => ({
      users: $.collection<{}>()
    }))
    const userId = await db.users.id()
    expect(typeof userId).toBe('string')
    expect(userId.length > 10).toBe(true)
  })
})
