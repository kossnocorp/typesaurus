import { schema } from '..'

describe('collection', () => {
  it('allows to name the collection', async () => {
    const id = Date.now().toString()
    const db = schema(($) => ({
      schedule: $.collection<any, string>(),
      nope: $.collection<any, string>().name('schedule')
    }))

    await db.nope.set(id, { hello: 'world' })
    const doc = await db.schedule.get(id)
    expect(doc?.data).toEqual({ hello: 'world' })
  })

  it('exposes path and the name', async () => {
    const db = schema(($) => ({
      schedule: $.collection<any, string>().sub({
        nope: $.collection<any, string>().name('items'),
        executions: $.collection<any, string>()
      })
    }))

    const nope = db.schedule('schedule-id').nope
    expect(nope.name).toEqual('items')
    expect(nope.path).toEqual('schedule/schedule-id/items')

    const executions = db.schedule('schedule-id').executions
    expect(executions.name).toEqual('executions')
    expect(executions.path).toEqual('schedule/schedule-id/executions')
  })
})
