import { schema } from '..'

describe('ref', () => {
  interface User {
    name: string
  }

  const db = schema(($) => ({
    users: $.collection<User>()
  }))

  it('creates ref object', () => {
    const userRef = db.users.ref('42')
    expect(userRef).toEqual({
      type: 'ref',
      id: '42',
      collection: db.users
    })
  })
})
