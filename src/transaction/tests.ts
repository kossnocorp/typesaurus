import sinon from 'sinon'
import { transaction } from '.'
import { Typesaurus, schema } from '..'

describe('transaction', () => {
  interface Counter {
    count: number
    optional?: true
  }

  interface Post {}

  const db = schema(($) => ({
    counters: $.collection<Counter>(),
    posts: $.collection<Post>().sub({
      counters: $.collection<Counter>()
    })
  }))

  let warn: typeof console.warn
  beforeAll(() => {
    warn = console.warn
  })

  beforeEach(() => {
    typeof jest !== 'undefined' && jest.setTimeout(20000)
    console.warn = sinon.spy()
  })

  afterAll(() => {
    console.warn = warn
  })

  const plusOne = async (
    counter: Typesaurus.Ref<[Counter, 'counters']>,
    useUpdate?: boolean
  ) =>
    transaction(db)
      .read(($) => $.db.counters.get(counter.id))
      .write(($) => {
        const newCount = ($.data?.data.count || 0) + 1
        const payload = { count: newCount }
        if (useUpdate) {
          $.data?.update(payload)
        } else {
          $.data?.set(payload)
        }
        return newCount
      })

  it('performs transaction', async () => {
    const id = await db.counters.id()
    const counter = db.counters.ref(id)
    await counter.set({ count: 0 })
    await Promise.all([plusOne(counter), plusOne(counter), plusOne(counter)])
    const doc = await counter.get()
    expect(doc?.data.count).toBe(3)
  })

  it('returns the value from the write function', async () => {
    const id = await db.counters.id()
    const counter = db.counters.ref(id)
    await counter.set({ count: 0 })
    const results = await Promise.all([
      plusOne(counter),
      plusOne(counter),
      plusOne(counter)
    ])
    expect(results.sort()).toEqual([1, 2, 3])
  })

  it('allows upsetting', async () => {
    const id = await db.counters.id()
    const counter = db.counters.ref(id)
    await counter.set({ count: 0, optional: true })

    await transaction(db)
      .read(($) => $.db.counters.get(counter.id))
      .write(($) => $.data?.upset({ count: ($.data?.data.count || 0) + 1 }))

    const doc = await counter.get()
    expect(doc?.data.count).toBe(1)
    expect(doc?.data.optional).toBe(true)
  })

  it('allows updating', async () => {
    const id = await db.counters.id()
    const counter = db.counters.ref(id)
    await counter.set({ count: 0 })

    await Promise.all([
      plusOne(counter, true),

      transaction(db)
        .read(($) => $.db.counters.get(counter.id))
        .write(($) =>
          $.data?.update({
            count: ($.data?.data.count || 0) + 1,
            optional: true
          })
        )
    ])

    const doc = await counter.get()
    expect(doc?.data.count).toBe(2)
    expect(doc?.data.optional).toBe(true)
  })

  it('allows removing', async () => {
    const id = await db.counters.id()
    const counter = db.counters.ref(id)
    await counter.set({ count: 0 })

    await transaction(db)
      .read(($) => $.db.counters.get(counter.id))
      .write(($) => $.data?.remove())

    const doc = await counter.get()
    expect(doc).toBe(null)
  })

  it('supports subcollections', async () => {
    const postId = await db.posts.id()
    const counterId = await db.counters.id()

    const plus = async () =>
      transaction(db)
        .read(($) => $.db.posts(postId).counters.get(counterId))
        .write(($) =>
          $.db.posts(postId).counters.set(counterId, {
            count: ($.data?.data.count || 0) + 1
          })
        )

    await Promise.all([plus(), plus(), plus()])

    const doc = await db
      .posts(postId)
      .counters.get(db.posts(postId).counters.id(counterId.toString()))

    expect(doc?.data.count).toBe(3)
  })

  it('allows to assert environment', async () => {
    const id = await db.counters.id()

    const server = () =>
      transaction(db, { as: 'server' })
        .read(($) => $.db.counters.get(id))
        .write(($) => $.data?.set({ count: ($.data?.data.count || 0) + 1 }))

    const client = () =>
      transaction(db, { as: 'client' })
        .read(($) => $.db.counters.get(id))
        .write(($) => $.data?.set({ count: ($.data?.data.count || 0) + 1 }))

    if (typeof window === 'undefined') {
      await server()
      expect(client).toThrowError('Expected client environment')
    } else {
      await client()
      expect(server).toThrowError('Expected server environment')
    }
  })
})
