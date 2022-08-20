import { schema } from '..'

describe('ref', () => {
  interface User {
    name: string
  }

  const db = schema(($) => ({
    users: $.collection<User>()
  }))

  it('creates ref object', () => {
    const userRef = db.users.ref(db.users.id('42'))
    expect(userRef).toEqual(
      (typeof jasmine !== 'undefined' ? jasmine : expect).objectContaining({
        type: 'ref',
        id: '42'
      })
    )
    expect(userRef.collection.type).toBe('collection')
    expect(userRef.collection.path).toBe('users')
    expect('get' in userRef.collection).toBe(true)
  })
})
