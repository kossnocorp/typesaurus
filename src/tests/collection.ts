import { schema } from '..'

describe('collection', () => {
  it('allows to configure the collection path', async () => {
    const id = Date.now().toString()
    const db = schema(($) => ({
      schedule: $.collection<any, string>(),
      nope: $.collection<any, string>()
    }))

    db.nope.configure({ path: 'schedule' })

    await db.nope.set(id, { hello: 'world' })
    const doc = await db.schedule.get(id)
    expect(doc?.data).toEqual({ hello: 'world' })
  })
})
