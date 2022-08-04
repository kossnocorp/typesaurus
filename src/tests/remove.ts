import { schema } from '..'

describe('remove', () => {
  interface User {
    name: string
  }

  const db = schema(($) => ({
    users: $.collection<User>()
  }))

  it('removes document', async () => {
    const user = await db.users.add({ name: 'Sasha' })
    const { id } = user
    await db.users.remove(id)
    const userFromDB = await user.get()
    expect(userFromDB).toBeNull()
  })

  it('allows removing via ref', async () => {
    const user = await db.users.add({ name: 'Sasha' })
    await user.remove()
    const userFromDB = await user.get()
    expect(userFromDB).toBeNull()
  })

  it('allows removing via doc', async () => {
    const user = await db.users.add({ name: 'Sasha' })
    const userDoc = await user.get()
    if (!userDoc) throw new Error('Document is not present')
    await userDoc.remove()
    const userFromDB = await user.get()
    expect(userFromDB).toBeNull()
  })
})
