import sinon from 'sinon'
import { schema, transaction, Typesaurus } from '..'

describe('transaction', () => {
  interface Counter {
    count: number
    optional?: true
  }

  interface Post {
    counter: Typesaurus.Ref<Counter, 'counters'>
  }

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
    counter: Typesaurus.Ref<Counter, 'counters'>,
    useUpdate?: boolean
  ) =>
    transaction(db)
      .read(($) => $.db.counters.get(counter.id))
      .write(($) => {
        const newCount = ($.result?.data.count || 0) + 1
        const payload = { count: newCount }
        if (useUpdate) {
          $.result?.update(payload)
        } else {
          $.result?.set(payload)
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

  it('allows to assert environment', async () => {
    const id = await db.counters.id()

    const server = () =>
      transaction(db, { as: 'server' })
        .read(($) => $.db.counters.get(id))
        .write(($) => $.result?.set({ count: ($.result?.data.count || 0) + 1 }))

    const client = () =>
      transaction(db, { as: 'client' })
        .read(($) => $.db.counters.get(id))
        .write(($) => $.result?.set({ count: ($.result?.data.count || 0) + 1 }))

    if (typeof window === 'undefined') {
      await server()
      expect(client).toThrowError('Expected client environment')
    } else {
      await client()
      expect(server).toThrowError('Expected server environment')
    }
  })

  it('expands references', async () => {
    const counterRef = await db.counters.add({ count: 42 })
    const postRef = await db.posts.add({ counter: counterRef })

    return transaction(db)
      .read(($) => $.db.posts.get(postRef.id))
      .write(($) => {
        expect($.result?.data.counter.type).toBe('ref')
        expect($.result?.data.counter.collection.type).toBe('collection')
        expect($.result?.data.counter.collection.path).toBe('counters')
        expect($.result?.data.counter.collection.get).toBe(undefined)
      })
  })

  it('converts write docs', async () => {
    const id = await db.counters.id()
    const counter = db.counters.ref(id)
    await counter.set({ count: 0 })

    const result = await transaction(db)
      .read(($) => $.db.counters.get(counter.id))
      .write(($) => {
        $.db.counters.set(id, { count: ($.result?.data.count || 0) + 1 })
        return $.result
      })

    const doc = await result?.get()
    expect(doc?.data.count).toBe(1)
  })

  describe('set', () => {
    it('allows setting', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await transaction(db)
        .read(($) => $.db.counters.get(counter.id))
        .write(($) =>
          $.db.counters.set(id, { count: ($.result?.data.count || 0) + 1 })
        )

      const doc = await counter.get()
      expect(doc?.data.count).toBe(1)
    })

    it('works on docs', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await transaction(db)
        .read(($) => $.db.counters.get(counter.id))
        .write(($) => $.result?.set({ count: ($.result?.data.count || 0) + 1 }))

      const doc = await counter.get()
      expect(doc?.data.count).toBe(1)
    })
  })

  describe('upset', () => {
    it('allows upsetting', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0, optional: true })

      await transaction(db)
        .read(($) => $.db.counters.get(counter.id))
        .write(($) =>
          $.db.counters.upset(id, { count: ($.result?.data.count || 0) + 1 })
        )

      const doc = await counter.get()
      expect(doc?.data.count).toBe(1)
      expect(doc?.data.optional).toBe(true)
    })

    it('works on docs', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0, optional: true })

      await transaction(db)
        .read(($) => $.db.counters.get(counter.id))
        .write(($) =>
          $.result?.upset({ count: ($.result?.data.count || 0) + 1 })
        )

      const doc = await counter.get()
      expect(doc?.data.count).toBe(1)
      expect(doc?.data.optional).toBe(true)
    })
  })

  describe('update', () => {
    it('allows updating', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await Promise.all([
        plusOne(counter, true),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) =>
            $.db.counters.update(id, {
              count: ($.result?.data.count || 0) + 1,
              optional: true
            })
          )
      ])

      const doc = await counter.get()
      expect(doc?.data.count).toBe(2)
      expect(doc?.data.optional).toBe(true)
    })

    it('works on docs', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await Promise.all([
        plusOne(counter, true),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) =>
            $.result?.update({
              count: ($.result?.data.count || 0) + 1,
              optional: true
            })
          )
      ])

      const doc = await counter.get()
      expect(doc?.data.count).toBe(2)
      expect(doc?.data.optional).toBe(true)
    })

    it('allows to update via array of fields', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await Promise.all([
        plusOne(counter, true),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) => {
            const { result } = $
            result?.update(($) => [
              $.field('count').set((result.data.count || 0) + 1),
              $.field('optional').set(true)
            ])
          })
      ])

      const doc = await counter.get()
      expect(doc?.data.count).toBe(2)
      expect(doc?.data.optional).toBe(true)
    })

    it('filters out the empty fields properly', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await Promise.all([
        plusOne(counter, true),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) => {
            // TODO: Make $.result readonly so there's no need to assign a variable?
            const { result } = $
            return result?.update(($) => [
              false,
              undefined,
              null,
              0,
              $.field('count').set((result.data.count || 0) + 1),
              $.field('optional').set(true)
            ])
          })
      ])

      const doc = await counter.get()
      expect(doc?.data.count).toBe(2)
      expect(doc?.data.optional).toBe(true)
    })

    it('skips empty updates', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await Promise.all([
        plusOne(counter, true),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) => undefined),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) => null),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) => 0),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) => false),

        transaction(db)
          .read(($) => $.db.counters.get(counter.id))
          .write(($) => [undefined, null, 0, false])
      ])

      const doc = await counter.get()
      expect(doc?.data.count).toBe(1)
      expect(doc?.data.optional).toBe(undefined)
    })
  })

  describe('remove', () => {
    it('allows removing', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await transaction(db)
        .read(($) => $.db.counters.get(counter.id))
        .write(($) => $.db.counters.remove(id))

      const doc = await counter.get()
      expect(doc).toBe(null)
    })

    it('works on docs', async () => {
      const id = await db.counters.id()
      const counter = db.counters.ref(id)
      await counter.set({ count: 0 })

      await transaction(db)
        .read(($) => $.db.counters.get(counter.id))
        .write(($) => $.result?.remove())

      const doc = await counter.get()
      expect(doc).toBe(null)
    })
  })

  describe('subcollection', () => {
    it('works on subcollections', async () => {
      const postId = await db.posts.id()
      const counterId = await db.posts.sub.counters.id()

      const plus = async () =>
        transaction(db)
          .read(($) => $.db.posts(postId).counters.get(counterId))
          .write(($) =>
            $.db.posts(postId).counters.set(counterId, {
              count: ($.result?.data.count || 0) + 1
            })
          )

      await Promise.all([plus(), plus(), plus()])

      const doc = await db
        .posts(postId)
        .counters.get(db.posts.sub.counters.id(counterId.toString()))

      expect(doc?.data.count).toBe(3)
    })
  })
})
