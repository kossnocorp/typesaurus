import { schema } from '..'

describe('id', () => {
  it('generates random id', async () => {
    const db = schema(($) => ({}))
    const userId = await db.id()
    expect(typeof userId).toBe('string')
    expect(userId.length > 10).toBe(true)
  })
})
