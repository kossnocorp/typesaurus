import { schema } from '..'

describe('remove', () => {
  interface User {
    name: string
  }

  interface Order {
    title: string
  }

  const db = schema(($) => ({
    users: $.collection<User>().sub({
      orders: $.collection<Order>()
    })
  }))

  it('removes document', async () => {
    const user = await db.users.add({ name: 'Sasha' })
    const { id } = user
    await db.users.remove(id)
    const userFromDB = await user.get()
    expect(userFromDB).toBeNull()
  })

  describe('ref', () => {
    it('works on refs', async () => {
      const user = await db.users.add({ name: 'Sasha' })
      await user.remove()
      const userFromDB = await user.get()
      expect(userFromDB).toBeNull()
    })
  })

  describe('doc', () => {
    it('works on docs', async () => {
      const user = await db.users.add({ name: 'Sasha' })
      const userDoc = await user.get()
      if (!userDoc) throw new Error('Document is not present')
      await userDoc.remove()
      const userFromDB = await user.get()
      expect(userFromDB).toBeNull()
    })
  })

  describe('subcollection', () => {
    it('works on subcollections', async () => {
      const userId = await db.users.id()
      const orderId = await db.users.sub.orders.id()
      const orderRef = await db
        .users(userId)
        .orders.set(orderId, { title: 'Amazing product' })
      await db.users(userId).orders.remove(orderRef.id)
      const order = await db.users(userId).orders.get(orderRef.id)
      expect(order).toBeNull()
    })
  })
})
