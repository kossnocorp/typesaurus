import { schema } from '..'

describe('id', () => {
  const db = schema(($) => ({
    users: $.collection<{}>().sub({
      orders: $.collection<{}>().sub({
        updates: $.collection<{}>()
      })
    })
  }))

  it('generates random id', async () => {
    const userId = await db.users.id()
    expect(typeof userId).toBe('string')
    expect(userId.length > 10).toBe(true)
  })

  it('returns typed id if a string is passed', () => {
    expect(db.users.id('hello')).toBe('hello')
  })

  it('generates subcollection id shortcut', async () => {
    expect(typeof (await db.users.sub.orders.id())).toBe('string')
    expect(db.users.sub.orders.id('hello')).toBe('hello')

    expect(typeof (await db.users.sub.orders.sub.updates.id())).toBe('string')
    expect(db.users.sub.orders.sub.updates.id('hello')).toBe('hello')
  })
})
