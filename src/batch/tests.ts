import { schema, batch } from '..'

describe('batch', () => {
  interface User {
    name: string
    foo?: boolean
  }

  interface Order {
    title: string
  }

  const db = schema(($) => ({
    users: $.collection<User>().sub({
      orders: $.collection<Order>()
    })
  }))

  it('performs batch operations', async () => {
    const $ = batch(db)
    const id = Math.random().toString()
    const sashaId = db.users.id(`${id}-sasha`)
    const tatiId = db.users.id(`${id}-tati`)
    const edId = db.users.id(`${id}-ed`)
    $.users.set(sashaId, { name: 'Sasha' })
    $.users.set(tatiId, { name: 'Tati' })
    $.users.set(edId, { name: 'Ed' })
    await $()
    const [sasha, tati, ed] = await Promise.all([
      db.users.get(sashaId),
      db.users.get(tatiId),
      db.users.get(edId)
    ])
    expect(sasha?.data.name).toBe('Sasha')
    expect(tati?.data.name).toBe('Tati')
    expect(ed?.data.name).toBe('Ed')
  })

  it('allows set a new document', async () => {
    const $ = batch(db)
    const id = Math.random().toString()
    const sashaId = db.users.id(`${id}-sasha`)
    const tatiId = db.users.id(`${id}-tati`)
    const edId = db.users.id(`${id}-ed`)
    $.users.set(sashaId, { name: 'Sasha' })
    $.users.set(tatiId, { name: 'Tati' })
    $.users.set(edId, { name: 'Ed' })
    await $()
    const [sasha, tati, ed] = await Promise.all([
      db.users.get(sashaId),
      db.users.get(tatiId),
      db.users.get(edId)
    ])
    expect(sasha?.data.name).toBe('Sasha')
    expect(tati?.data.name).toBe('Tati')
    expect(ed?.data.name).toBe('Ed')
  })

  it('allows upsetting', async () => {
    const $ = batch(db)
    const id = Math.random().toString()
    const sashaId = db.users.id(`${id}-sasha`)
    const tatiId = db.users.id(`${id}-tati`)
    const edId = db.users.id(`${id}-ed`)
    await Promise.all([
      db.users.set(sashaId, { name: 'Sasha', foo: true }),
      db.users.set(tatiId, { name: 'Tati', foo: true }),
      db.users.set(edId, { name: 'Ed', foo: true })
    ])
    $.users.upset(sashaId, { name: 'Sasha Koss' })
    $.users.upset(tatiId, { name: 'Tati Shepeleva', foo: false })
    $.users.upset(edId, { name: 'Ed Tsech' })
    await $()
    const [sasha, tati, ed] = await Promise.all([
      db.users.get(sashaId),
      db.users.get(tatiId),
      db.users.get(edId)
    ])
    expect(sasha?.data).toEqual({ name: 'Sasha Koss', foo: true })
    expect(tati?.data).toEqual({ name: 'Tati Shepeleva', foo: false })
    expect(ed?.data).toEqual({ name: 'Ed Tsech', foo: true })
  })

  it('allows updating', async () => {
    const $ = batch(db)
    const id = Math.random().toString()
    const sashaId = db.users.id(`${id}-sasha`)
    const tatiId = db.users.id(`${id}-tati`)
    const edId = db.users.id(`${id}-ed`)
    await Promise.all([
      db.users.set(sashaId, { name: 'Sasha' }),
      db.users.set(tatiId, { name: 'Tati' }),
      db.users.set(edId, { name: 'Ed' })
    ])
    $.users.update(sashaId, { name: 'Sasha Koss' })
    $.users.update(tatiId, { name: 'Tati Shepeleva' })
    $.users.update(edId, { name: 'Ed Tsech' })
    await $()
    const [sasha, tati, ed] = await Promise.all([
      db.users.get(sashaId),
      db.users.get(tatiId),
      db.users.get(edId)
    ])
    expect(sasha?.data.name).toBe('Sasha Koss')
    expect(tati?.data.name).toBe('Tati Shepeleva')
    expect(ed?.data.name).toBe('Ed Tsech')
  })

  it('allows removing', async () => {
    const $ = batch(db)
    const id = Math.random().toString()
    const sashaId = db.users.id(`${id}-sasha`)
    const tatiId = db.users.id(`${id}-tati`)
    const edId = db.users.id(`${id}-ed`)
    await Promise.all([
      db.users.set(sashaId, { name: 'Sasha' }),
      db.users.set(tatiId, { name: 'Tati' }),
      db.users.set(edId, { name: 'Ed' })
    ])
    $.users.remove(sashaId)
    $.users.remove(tatiId)
    $.users.remove(edId)
    await $()
    const [sasha, tati, ed] = await Promise.all([
      db.users.get(sashaId),
      db.users.get(tatiId),
      db.users.get(edId)
    ])
    expect(sasha).toBeNull()
    expect(tati).toBeNull()
    expect(ed).toBeNull()
  })

  it('allows to assert environment', async () => {
    const server = () => batch(db, { as: 'server' })
    const client = () => batch(db, { as: 'client' })

    if (typeof window === 'undefined') {
      await server()
      expect(client).toThrowError('Expected client environment')
    } else {
      await client()
      expect(server).toThrowError('Expected server environment')
    }
  })

  describe('subcollection', () => {
    it('works on subcollections', async () => {
      const userId = await db.users.id()
      const orderId1 = await db.users(userId).orders.id()
      const orderId2 = await db.users(userId).orders.id()

      const $ = batch(db)
      $.users(userId).orders.set(orderId1, { title: 'First order' })
      $.users(userId).orders.set(orderId2, { title: 'Another order' })
      await $()

      const [order1, order2] = await db
        .users(userId)
        .orders.many([orderId1, orderId2])

      expect(order1?.data.title).toBe('First order')
      expect(order2?.data.title).toBe('Another order')
    })
  })
})
