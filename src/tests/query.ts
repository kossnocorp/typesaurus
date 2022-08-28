import { nanoid } from 'nanoid'
import sinon from 'sinon'
import { groups, schema, Typesaurus } from '..'

describe('query', () => {
  interface Contact {
    ownerId: string
    name: string
    year: number
    birthday: Date
    lastMessage?: Typesaurus.Ref<Message, 'contacts/contactMessages'>
  }

  interface Message {
    ownerId: string
    author: Typesaurus.Ref<Contact, 'contacts'>
    text: string
    lastReply?: Typesaurus.Ref<Reply, 'messages/replies'>
  }

  interface Reply {
    ownerId: string
    text: string
  }

  const db = schema(($) => ({
    contacts: $.collection<Contact>(),
    messages: $.collection<Message>().sub({
      replies: $.collection<Reply>()
    })
  }))

  const ownerId = nanoid()
  const leshaId = db.contacts.id(`lesha-${ownerId}`)
  const sashaId = db.contacts.id(`sasha-${ownerId}`)
  const tatiId = db.contacts.id(`tati-${ownerId}`)

  function setLesha() {
    return db.contacts.set(leshaId, {
      ownerId,
      name: 'Lesha',
      year: 1995,
      birthday: new Date(1995, 6, 2)
    })
  }

  beforeAll(() =>
    Promise.all([
      setLesha(),
      db.contacts.set(sashaId, {
        ownerId,
        name: 'Sasha',
        year: 1987,
        birthday: new Date(1987, 1, 11)
      }),
      db.contacts.set(tatiId, {
        ownerId,
        name: 'Tati',
        year: 1989,
        birthday: new Date(1989, 6, 10)
      }),
      db.messages.add({
        ownerId,
        author: db.contacts.ref(sashaId),
        text: '+1'
      }),
      db.messages.add({
        ownerId,
        author: db.contacts.ref(leshaId),
        text: '+1'
      }),
      db.messages.add({
        ownerId,
        author: db.contacts.ref(tatiId),
        text: 'wut'
      }),
      db.messages.add({
        ownerId,
        author: db.contacts.ref(sashaId),
        text: 'lul'
      })
    ])
  )

  describe('assering environment', () => {
    it('allows to assert environment', async () => {
      const server = () =>
        db.contacts.query(($) => $.field('ownerId').equal(ownerId), {
          as: 'server'
        })
      const client = () =>
        db.contacts.query(($) => $.field('ownerId').equal(ownerId), {
          as: 'client'
        })

      if (typeof window === 'undefined') {
        await server()
        expect(client).toThrowError('Expected client environment')
      } else {
        await client()
        expect(server).toThrowError('Expected server environment')
      }
    })

    it('allows to assert environment as the builder', async () => {
      const server = () => db.contacts.query.build({ as: 'server' })
      const client = () => db.contacts.query.build({ as: 'client' })

      if (typeof window === 'undefined') {
        await server()
        expect(client).toThrowError('Expected client environment')
      } else {
        await client()
        expect(server).toThrowError('Expected server environment')
      }
    })
  })

  describe('promise', () => {
    it('queries documents', async () => {
      const docs = await db.contacts.query(($) =>
        $.field('ownerId').equal(ownerId)
      )
      expect(docs.map(({ data: { name } }) => name).sort()).toEqual([
        'Lesha',
        'Sasha',
        'Tati'
      ])
    })

    it('allows to query by value in maps', async () => {
      interface Location {
        mapId: string
        name: string
        address: { city: string }
      }

      const db = schema(($) => ({
        locations: $.collection<Location>()
      }))

      const mapId = nanoid()

      await Promise.all([
        db.locations.add({
          mapId,
          name: 'Pizza City',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Bagels Tower',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Tacos Cave',
          address: { city: 'Houston' }
        })
      ])

      const docs = await db.locations.query(($) => [
        $.field('mapId').equal(mapId),
        $.field('address', 'city').equal('New York')
      ])

      expect(docs.map(({ data: { name } }) => name).sort()).toEqual([
        'Bagels Tower',
        'Pizza City'
      ])
    })

    it('allows to build query', async () => {
      interface Location {
        mapId: string
        name: string
        address: { city: string }
      }

      const db = schema(($) => ({
        locations: $.collection<Location>()
      }))

      const mapId = nanoid()

      await Promise.all([
        db.locations.add({
          mapId,
          name: 'Pizza City',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Bagels Tower',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Tacos Cave',
          address: { city: 'Houston' }
        })
      ])

      const $ = db.locations.query.build()

      $.field('mapId').equal(mapId)
      $.field('address', 'city').equal('New York')

      const docs = await $.run()

      expect(docs.map(({ data: { name } }) => name).sort()).toEqual([
        'Bagels Tower',
        'Pizza City'
      ])
    })

    it('allows to query using array-contains filter', async () => {
      type Tag = 'pets' | 'cats' | 'dogs' | 'food' | 'hotdogs'

      interface Post {
        blogId: string
        title: string
        tags: Tag[]
      }

      const db = schema(($) => ({
        posts: $.collection<Post>()
      }))

      const blogId = nanoid()

      await Promise.all([
        db.posts.add({
          blogId,
          title: 'Post about cats',
          tags: ['pets', 'cats']
        }),
        db.posts.add({
          blogId,
          title: 'Post about dogs',
          tags: ['pets', 'dogs']
        }),
        db.posts.add({
          blogId,
          title: 'Post about hotdogs',
          tags: ['food', 'hotdogs']
        })
      ])

      const docs = await db.posts.query(($) => [
        $.field('blogId').equal(blogId),
        $.field('tags').contains('pets')
      ])

      expect(docs.map(({ data: { title } }) => title).sort()).toEqual([
        'Post about cats',
        'Post about dogs'
      ])
    })

    it('allows to query using in filter', async () => {
      interface Pet {
        ownerId: string
        name: string
        type: 'dog' | 'cat' | 'parrot' | 'snake'
      }

      const db = schema(($) => ({
        pets: $.collection<Pet>()
      }))

      const ownerId = nanoid()

      await Promise.all([
        db.pets.add({
          ownerId,
          name: 'Persik',
          type: 'dog'
        }),
        db.pets.add({
          ownerId,
          name: 'Kimchi',
          type: 'cat'
        }),
        db.pets.add({
          ownerId,
          name: 'Snako',
          type: 'snake'
        })
      ])

      const docs = await db.pets.query(($) => [
        $.field('ownerId').equal(ownerId),
        $.field('type').in(['cat', 'dog'])
      ])

      expect(docs.map(({ data: { name } }) => name).sort()).toEqual([
        'Kimchi',
        'Persik'
      ])
    })

    it('allows to query using array-contains-any filter', async () => {
      type Tag = 'pets' | 'cats' | 'dogs' | 'wildlife' | 'food' | 'hotdogs'

      interface Post {
        blogId: string
        title: string
        tags: Tag[]
      }

      const db = schema(($) => ({
        posts: $.collection<Post>()
      }))

      const blogId = nanoid()

      await Promise.all([
        db.posts.add({
          blogId,
          title: 'Post about cats',
          tags: ['pets', 'cats']
        }),
        db.posts.add({
          blogId,
          title: 'Post about dogs',
          tags: ['pets', 'dogs']
        }),
        db.posts.add({
          blogId,
          title: 'Post about hotdogs',
          tags: ['food', 'hotdogs']
        }),
        db.posts.add({
          blogId,
          title: 'Post about kangaroos',
          tags: ['wildlife']
        })
      ])

      const docs = await db.posts.query(($) => [
        $.field('blogId').equal(blogId),
        $.field('tags').containsAny(['pets', 'wildlife'])
      ])

      expect(docs.map(({ data: { title } }) => title).sort()).toEqual([
        'Post about cats',
        'Post about dogs',
        'Post about kangaroos'
      ])
    })

    it('expands references', async () => {
      const docs = await db.messages.query(($) => [
        $.field('ownerId').equal(ownerId),
        $.field('text').equal('+1')
      ])

      expect(docs[0]?.data.author.type).toBe('ref')
      expect(docs[0]?.data.author.collection.type).toBe('collection')
      expect(docs[0]?.data.author.collection.path).toBe('contacts')

      const authors = await Promise.all(
        docs.map((doc) => doc.data.author.get())
      )
      expect(authors.map((doc) => doc?.data.name).sort()).toEqual([
        'Lesha',
        'Sasha'
      ])
    })

    it('allows to query by reference', async () => {
      const docs = await db.messages.query(($) => [
        $.field('ownerId').equal(ownerId),
        $.field('author').equal(db.contacts.ref(sashaId))
      ])
      expect(docs.map((doc) => doc.data.text).sort()).toEqual(['+1', 'lul'])
    })

    it('allows to query by date', async () => {
      const docs = await db.contacts.query(($) => [
        $.field('ownerId').equal(ownerId),
        $.field('birthday').equal(new Date(1987, 1, 11))
      ])
      expect(docs.length).toBe(1)
      expect(docs[0]?.data.name).toBe('Sasha')
    })

    describe('subcollection', () => {
      it('works on subcollections', async () => {
        const ownerId = nanoid()
        const messageId = await db.messages.id()

        await Promise.all([
          db.messages(messageId).replies.add({ ownerId, text: 'Hey!' }),
          db.messages(messageId).replies.add({ ownerId, text: 'Ho!' }),
          db
            .messages(messageId)
            .replies.add({ ownerId: 'another-id', text: "Let's go" })
        ])

        const updates = await db
          .messages(messageId)
          .replies.query(($) => $.field('ownerId').equal(ownerId))

        expect(updates.map((o) => o.data.text).sort()).toEqual(['Hey!', 'Ho!'])
      })

      it('expands references', async () => {
        const ownerId = nanoid()
        const messageId = await db.messages.id()

        const replyRef = await db.messages(messageId).replies.add({
          ownerId,
          text: 'Hi!'
        })

        await db.messages.set(messageId, {
          ownerId,
          author: db.contacts.ref(sashaId),
          text: 'Hey!',
          lastReply: replyRef
        })

        const messages = await db.messages.query(($) =>
          $.field('ownerId').equal(ownerId)
        )

        expect(messages[0]?.data.lastReply?.type).toBe('ref')
        expect(messages[0]?.data.lastReply?.id).toBe(replyRef.id)

        expect(messages[0]?.data.lastReply?.collection.type).toBe('collection')
        expect(messages[0]?.data.lastReply?.collection.path).toBe(
          `messages/${messageId}/replies`
        )
      })
    })

    describe('groups', () => {
      interface Post {
        ownerId: string
        title: string
      }

      const db = schema(($) => ({
        contacts: $.collection<Contact>().sub({
          contactMessages: $.collection<Message>().sub({
            messagePosts: $.collection<Post>()
          })
        })
      }))

      afterEach(() =>
        groups(db)
          .contactMessages.all()
          .then((docs) => docs.map((doc) => doc.remove()))
      )

      it('allows querying collection groups', async () => {
        const ownerId = nanoid()
        const sashaRef = db.contacts.ref(sashaId)
        const tatiRef = db.contacts.ref(tatiId)

        await Promise.all([
          db.contacts(sashaId).contactMessages.add({
            ownerId,
            author: sashaRef,
            text: 'Hello from Sasha!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello from Tati!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello, again!'
          })
        ])

        const messages = await groups(db).contactMessages.query(($) => [
          $.field('ownerId').equal(ownerId)
        ])

        expect(messages.map((m) => m.data.text).sort()).toEqual([
          'Hello from Sasha!',
          'Hello from Tati!',
          'Hello, again!'
        ])
      })

      it('allows querying nested subcollection groups', async () => {
        const ownerId = await db.contacts.id()
        const messageId = await db.contacts(ownerId).contactMessages.id()

        await Promise.all([
          db.contacts(ownerId).contactMessages(messageId).messagePosts.add({
            ownerId: ownerId.toString(),
            title: 'Hello'
          }),

          db.contacts(ownerId).contactMessages(messageId).messagePosts.add({
            ownerId: ownerId.toString(),
            title: 'Hello, again!'
          })
        ])

        const posts = await groups(db).messagePosts.query(($) => [
          $.field('ownerId').equal(ownerId.toString())
        ])

        expect(posts.map((m) => m.data.title).sort()).toEqual([
          'Hello',
          'Hello, again!'
        ])
      })

      it('expands references', async () => {
        const ownerId = nanoid()
        const contactId = await db.contacts.id()

        const messageRef = await db.contacts(contactId).contactMessages.add({
          ownerId,
          author: db.contacts.ref(sashaId),
          text: 'Hola!'
        })

        await db.contacts.set(contactId, {
          ownerId,
          name: 'Sasha',
          year: 1987,
          birthday: new Date(1987, 1, 11),
          lastMessage: messageRef
        })

        const contacts = await groups(db).contacts.query(($) =>
          $.field('ownerId').equal(ownerId)
        )

        expect(contacts[0]?.data.lastMessage?.type).toBe('ref')
        expect(contacts[0]?.data.lastMessage?.collection.type).toBe(
          'collection'
        )
        expect(contacts[0]?.data.lastMessage?.collection.path).toBe(
          `contacts/${contactId}/contactMessages`
        )
      })

      it('allows to build query', async () => {
        const ownerId = nanoid()
        const sashaRef = db.contacts.ref(sashaId)
        const tatiRef = db.contacts.ref(tatiId)

        await Promise.all([
          db.contacts(sashaId).contactMessages.add({
            ownerId,
            author: sashaRef,
            text: 'Hello from Sasha!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello from Tati!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello, again!'
          })
        ])

        const $ = groups(db).contactMessages.query.build()

        $.field('ownerId').equal(ownerId)

        const messages = await $.run()

        expect(messages.map((m) => m.data.text).sort()).toEqual([
          'Hello from Sasha!',
          'Hello from Tati!',
          'Hello, again!'
        ])
      })
    })

    describe('ordering', () => {
      it('allows ordering', async () => {
        const docs = await db.contacts.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('year').order('asc')
        ])
        expect(docs.map(({ data: { name } }) => name)).toEqual([
          'Sasha',
          'Tati',
          'Lesha'
        ])
      })

      it('allows ordering by desc', async () => {
        const docs = await db.contacts.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('year').order('desc')
        ])
        expect(docs.map(({ data: { name } }) => name)).toEqual([
          'Lesha',
          'Tati',
          'Sasha'
        ])
      })

      it('allows ordering by references', async () => {
        const docs = await db.messages.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('author').order('desc'),
          $.field('text').order()
        ])
        const messagesLog = await Promise.all(
          docs.map((doc) =>
            doc.data.author
              .get()
              .then((contact) => `${contact?.data.name}: ${doc.data.text}`)
          )
        )
        expect(messagesLog).toEqual([
          'Tati: wut',
          'Sasha: +1',
          'Sasha: lul',
          'Lesha: +1'
        ])
      })

      it('allows ordering by date', async () => {
        const docs = await db.contacts.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('birthday').order('asc')
        ])
        expect(docs.map(({ data: { name } }) => name)).toEqual([
          'Sasha',
          'Tati',
          'Lesha'
        ])
      })
    })

    describe('limiting', () => {
      it('allows to limit response length', async () => {
        const docs = await db.contacts.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('year').order('asc'),
          $.limit(2)
        ])
        expect(docs.map(({ data: { name } }) => name)).toEqual([
          'Sasha',
          'Tati'
        ])
      })
    })

    describe('paginating', () => {
      describe('startAfter', () => {
        it('allows to paginate', async () => {
          const page1Docs = await db.contacts.query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('year').order('asc', $.startAfter(undefined)),
            $.limit(2)
          ])
          expect(page1Docs.map(({ data: { name } }) => name)).toEqual([
            'Sasha',
            'Tati'
          ])
          const page2Docs = await db.contacts.query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('year').order('asc', $.startAfter(page1Docs[1]!.data.year)),
            $.limit(2)
          ])
          expect(page2Docs.map(({ data: { name } }) => name)).toEqual(['Lesha'])
        })
      })

      describe('startAt', () => {
        it('allows to paginate', async () => {
          const docs = await db.contacts.query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('year').order('asc', $.startAt(1989)),
            $.limit(2)
          ])
          expect(docs.map(({ data: { name } }) => name)).toEqual([
            'Tati',
            'Lesha'
          ])
        })
      })

      describe('endBefore', () => {
        it('allows to paginate', async () => {
          const docs = await db.contacts.query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('year').order('asc', $.endBefore(1989)),
            $.limit(2)
          ])
          expect(docs.map(({ data: { name } }) => name)).toEqual(['Sasha'])
        })
      })

      describe('endAt', () => {
        it('allows to paginate', async () => {
          const docs = await db.contacts.query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('year').order('asc', $.endAt(1989)),
            $.limit(2)
          ])
          expect(docs.map(({ data: { name } }) => name)).toEqual([
            'Sasha',
            'Tati'
          ])
        })
      })

      it('uses asc ordering method by default', async () => {
        const docs = await db.contacts.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('year').order($.startAt(1989)),
          $.limit(2)
        ])
        expect(docs.map(({ data: { name } }) => name)).toEqual([
          'Tati',
          'Lesha'
        ])
      })

      it('allows specify multiple cursor conditions', async () => {
        interface City {
          mapId: string
          name: string
          state: string
        }

        const db = schema(($) => ({
          cities: $.collection<City>()
        }))

        const mapId = nanoid()

        await Promise.all([
          db.cities.add({
            mapId,
            name: 'Springfield',
            state: 'Massachusetts'
          }),

          db.cities.add({
            mapId,
            name: 'Springfield',
            state: 'Missouri'
          }),

          db.cities.add({
            mapId,
            name: 'Springfield',
            state: 'Wisconsin'
          })
        ])

        const docs = await db.cities.query(($) => [
          $.field('mapId').equal(mapId),
          $.field('name').order('asc', $.startAt('Springfield')),
          $.field('state').order('asc', $.startAt('Missouri')),
          $.limit(2)
        ])

        expect(
          docs.map(({ data: { name, state } }) => `${name}, ${state}`)
        ).toEqual(['Springfield, Missouri', 'Springfield, Wisconsin'])
      })

      it('allows to combine cursors', async () => {
        const docs = await db.contacts.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('year').order('asc', $.startAt(1989), $.endAt(1989)),
          $.limit(2)
        ])
        expect(docs.map(({ data: { name } }) => name)).toEqual(['Tati'])
      })

      it('allows to pass docs as cursors', async () => {
        const tati = await db.contacts.get(tatiId)
        const docs =
          tati &&
          (await db.contacts.query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('year').order('asc', $.startAt(tati)),
            $.limit(2)
          ]))
        expect(docs?.map(({ data: { name } }) => name)).toEqual([
          'Tati',
          'Lesha'
        ])
      })

      it('allows using dates as cursors', async () => {
        const docs = await db.contacts.query(($) => [
          $.field('ownerId').equal(ownerId),
          $.field('birthday').order('asc', $.startAt(new Date(1989, 6, 10))),
          $.limit(2)
        ])
        expect(docs.map(({ data: { name } }) => name)).toEqual([
          'Tati',
          'Lesha'
        ])
      })
    })

    describe('docId', () => {
      interface Counter {
        n: number
      }

      const db = schema(($) => ({
        shardedCounters: $.collection<Counter>()
      }))

      beforeAll(() =>
        Promise.all([
          db.shardedCounters.set(db.shardedCounters.id('draft-0'), { n: 0 }),
          db.shardedCounters.set(db.shardedCounters.id('draft-1'), { n: 0 }),
          db.shardedCounters.set(db.shardedCounters.id('published-0'), {
            n: 0
          }),
          db.shardedCounters.set(db.shardedCounters.id('published-1'), {
            n: 0
          }),
          db.shardedCounters.set(db.shardedCounters.id('suspended-0'), {
            n: 0
          }),
          db.shardedCounters.set(db.shardedCounters.id('suspended-1'), { n: 0 })
        ])
      )

      it('allows to query by documentId', async () => {
        const docs = await db.shardedCounters.query(($) => [
          $.field($.docId()).moreOrEqual(db.shardedCounters.id('published')),
          $.field($.docId()).less(db.shardedCounters.id('publishee'))
        ])
        expect(docs.map((doc) => doc.ref.id)).toEqual([
          'published-0',
          'published-1'
        ])
      })

      it('allows ordering by documentId', async () => {
        // NOTE: At the moment descending order is not supported:
        // https://stackoverflow.com/a/52119324
        //
        // const descend = await db.shardedCounters.query(($) => [
        //   $.where(docId, '>=', 'published'),
        //   $.where(docId, '<', 'publishee'),
        //   $.order(docId, 'desc')
        // ])
        // expect(descend.length).toBe(2)
        // expect(descend[0]?.ref.id).toBe(`published-1`)
        // expect(descend[1]?.ref.id).toBe(`published-0`)

        const ascend = await db.shardedCounters.query(($) => [
          $.field($.docId()).moreOrEqual(db.shardedCounters.id('published')),
          $.field($.docId()).less(db.shardedCounters.id('publishee')),
          $.field($.docId()).order()
        ])
        expect(ascend.length).toBe(2)
        expect(ascend[0]?.ref.id).toBe(`published-0`)
        expect(ascend[1]?.ref.id).toBe(`published-1`)
      })

      it('allows cursors to use documentId', async () => {
        const docs = await db.shardedCounters.query(($) => [
          $.field($.docId()).order(
            'asc',
            $.startAt(db.shardedCounters.id('draft-1')),
            $.endAt(db.shardedCounters.id('published-1'))
          )
        ])
        expect(docs.length).toBe(3)
        expect(docs[0]?.ref.id).toBe(`draft-1`)
        expect(docs[1]?.ref.id).toBe(`published-0`)
        expect(docs[2]?.ref.id).toBe(`published-1`)
      })
    })
  })

  describe('subscription', () => {
    let off: (() => void) | undefined

    function setLesha() {
      return db.contacts.set(leshaId, {
        ownerId,
        name: 'Lesha',
        year: 1995,
        birthday: new Date(1995, 6, 2)
      })
    }

    afterEach(() => {
      off?.()
      off = undefined
    })

    it('queries documents', (done) => {
      const spy = sinon.spy()
      off = db.contacts
        .query(($) => $.field('ownerId').equal(ownerId))
        .on((docs) => {
          spy(docs.map(({ data: { name } }) => name).sort())
          if (spy.calledWithMatch(['Lesha', 'Sasha', 'Tati'])) done()
        })
    })

    it('allows to query by value in maps', async () => {
      interface Location {
        mapId: string
        name: string
        address: { city: string }
      }

      const db = schema(($) => ({
        locations: $.collection<Location>()
      }))

      const spy = sinon.spy()
      const mapId = nanoid()

      await Promise.all([
        db.locations.add({
          mapId,
          name: 'Pizza City',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Bagels Tower',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Tacos Cave',
          address: { city: 'Houston' }
        })
      ])

      return new Promise((resolve) => {
        off = db.locations
          .query(($) => [
            $.field('mapId').equal(mapId),
            $.field('address', 'city').equal('New York')
          ])
          .on((docs) => {
            spy(docs.map(({ data: { name } }) => name).sort())
            if (spy.calledWithMatch(['Bagels Tower', 'Pizza City']))
              resolve(void 0)
          })
      })
    })

    it('allows to query using array-contains filter', async () => {
      type Tag = 'pets' | 'cats' | 'dogs' | 'food' | 'hotdogs'

      interface Post {
        blogId: string
        title: string
        tags: Tag[]
      }

      const db = schema(($) => ({
        posts: $.collection<Post>()
      }))

      const spy = sinon.spy()
      const blogId = nanoid()

      await Promise.all([
        db.posts.add({
          blogId,
          title: 'Post about cats',
          tags: ['pets', 'cats']
        }),
        db.posts.add({
          blogId,
          title: 'Post about dogs',
          tags: ['pets', 'dogs']
        }),
        db.posts.add({
          blogId,
          title: 'Post about hotdogs',
          tags: ['food', 'hotdogs']
        })
      ])

      return new Promise((resolve) => {
        off = db.posts
          .query(($) => [
            $.field('blogId').equal(blogId),
            $.field('tags').contains('pets')
          ])
          .on((docs) => {
            spy(docs.map(({ data: { title } }) => title).sort())
            if (spy.calledWithMatch(['Post about cats', 'Post about dogs']))
              resolve(void 0)
          })
      })
    })

    it('allows to build query', async () => {
      interface Location {
        mapId: string
        name: string
        address: { city: string }
      }

      const db = schema(($) => ({
        locations: $.collection<Location>()
      }))

      const spy = sinon.spy()
      const mapId = nanoid()

      await Promise.all([
        db.locations.add({
          mapId,
          name: 'Pizza City',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Bagels Tower',
          address: { city: 'New York' }
        }),
        db.locations.add({
          mapId,
          name: 'Tacos Cave',
          address: { city: 'Houston' }
        })
      ])

      const $ = db.locations.query.build()

      $.field('mapId').equal(mapId)
      $.field('address', 'city').equal('New York')

      return new Promise((resolve) => {
        off = $.run().on((docs) => {
          spy(docs.map(({ data: { name } }) => name).sort())
          if (spy.calledWithMatch(['Bagels Tower', 'Pizza City']))
            resolve(void 0)
        })
      })
    })

    it('allows to query using in filter', async () => {
      interface Pet {
        ownerId: string
        name: string
        type: 'dog' | 'cat' | 'parrot' | 'snake'
      }

      const db = schema(($) => ({
        pets: $.collection<Pet>()
      }))

      const ownerId = nanoid()
      const spy = sinon.spy()

      await Promise.all([
        db.pets.add({
          ownerId,
          name: 'Persik',
          type: 'dog'
        }),
        db.pets.add({
          ownerId,
          name: 'Kimchi',
          type: 'cat'
        }),
        db.pets.add({
          ownerId,
          name: 'Snako',
          type: 'snake'
        })
      ])

      return new Promise((resolve) => {
        off = db.pets
          .query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('type').in(['cat', 'dog'])
          ])
          .on((docs) => {
            spy(docs.map(({ data: { name } }) => name).sort())
            if (spy.calledWithMatch(['Kimchi', 'Persik'])) resolve(void 0)
          })
      })
    })

    it('allows to query using array-contains-any filter', async () => {
      type Tag = 'pets' | 'cats' | 'dogs' | 'wildlife' | 'food' | 'hotdogs'

      interface Post {
        blogId: string
        title: string
        tags: Tag[]
      }

      const db = schema(($) => ({
        posts: $.collection<Post>()
      }))

      const blogId = nanoid()
      const spy = sinon.spy()

      await Promise.all([
        db.posts.add({
          blogId,
          title: 'Post about cats',
          tags: ['pets', 'cats']
        }),
        db.posts.add({
          blogId,
          title: 'Post about dogs',
          tags: ['pets', 'dogs']
        }),
        db.posts.add({
          blogId,
          title: 'Post about hotdogs',
          tags: ['food', 'hotdogs']
        }),
        db.posts.add({
          blogId,
          title: 'Post about kangaroos',
          tags: ['wildlife']
        })
      ])

      return new Promise((resolve) => {
        off = db.posts
          .query(($) => [
            $.field('blogId').equal(blogId),
            $.field('tags').containsAny(['pets', 'wildlife'])
          ])
          .on((docs) => {
            spy(docs.map(({ data: { title } }) => title).sort())
            if (
              spy.calledWithMatch([
                'Post about cats',
                'Post about dogs',
                'Post about kangaroos'
              ])
            )
              resolve(void 0)
          })
      })
    })

    it('expands references', () =>
      new Promise((resolve) => {
        const spy = sinon.spy()
        off = db.messages
          .query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('text').equal('+1')
          ])
          .on(async (docs) => {
            expect(docs[0]?.data.author.type).toBe('ref')
            expect(docs[0]?.data.author.collection.type).toBe('collection')
            expect(docs[0]?.data.author.collection.path).toBe('contacts')

            const authors = await Promise.all(
              docs.map((doc) => doc.data.author.get())
            )
            spy(authors.map((doc) => doc?.data.name).sort())
            if (spy.calledWithMatch(['Lesha', 'Sasha'])) resolve(void 0)
          })
      }))

    it('allows to query by reference', () =>
      new Promise((resolve) => {
        const spy = sinon.spy()
        off = db.messages
          .query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('author').equal(db.contacts.ref(sashaId))
          ])
          .on((docs) => {
            spy(docs.map((doc) => doc.data.text).sort())
            if (spy.calledWithMatch(['+1', 'lul'])) resolve(void 0)
          })
      }))

    it('allows to query by date', () =>
      new Promise((resolve) => {
        off = db.contacts
          .query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('birthday').equal(new Date(1987, 1, 11))
          ])
          .on((docs) => {
            if (docs.length === 1 && docs[0]?.data.name === 'Sasha')
              resolve(void 0)
          })
      }))

    describe('subcollection', () => {
      it('works on subcollections', async () => {
        const ownerId = nanoid()
        const messageId = await db.messages.id()

        await Promise.all([
          db.messages(messageId).replies.add({ ownerId, text: 'Hey!' }),
          db.messages(messageId).replies.add({ ownerId, text: 'Ho!' }),
          db
            .messages(messageId)
            .replies.add({ ownerId: 'another-id', text: "Let's go" })
        ])

        return new Promise((resolve) => {
          off = db
            .messages(messageId)
            .replies.query(($) => $.field('ownerId').equal(ownerId))
            .on((updates) => {
              expect(updates.map((o) => o.data.text).sort()).toEqual([
                'Hey!',
                'Ho!'
              ])
              resolve(void 0)
            })
        })
      })

      it('expands references', async () => {
        const ownerId = nanoid()
        const messageId = await db.messages.id()

        const replyRef = await db.messages(messageId).replies.add({
          ownerId,
          text: 'Hi!'
        })

        await db.messages.set(messageId, {
          ownerId,
          author: db.contacts.ref(sashaId),
          text: 'Hey!',
          lastReply: replyRef
        })

        return new Promise((resolve) => {
          off = db.messages
            .query(($) => $.field('ownerId').equal(ownerId))
            .on((messages) => {
              expect(messages[0]?.data.lastReply?.type).toBe('ref')
              expect(messages[0]?.data.lastReply?.id).toBe(replyRef.id)

              expect(messages[0]?.data.lastReply?.collection.type).toBe(
                'collection'
              )
              expect(messages[0]?.data.lastReply?.collection.path).toBe(
                `messages/${messageId}/replies`
              )
              resolve(void 0)
            })
        })
      })
    })

    describe('groups', () => {
      interface Post {
        ownerId: string
        title: string
      }

      const db = schema(($) => ({
        contacts: $.collection<Contact>().sub({
          contactMessages: $.collection<Message>().sub({
            messagePosts: $.collection<Post>()
          })
        })
      }))

      afterEach(() =>
        groups(db)
          .contactMessages.all()
          .then((docs) => docs.map((doc) => doc.remove()))
      )

      it('allows querying collection groups', async () => {
        const sashaRef = db.contacts.ref(sashaId)
        const tatiRef = db.contacts.ref(tatiId)

        await Promise.all([
          db.contacts(sashaId).contactMessages.add({
            ownerId,
            author: sashaRef,
            text: 'Hello from Sasha!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello from Tati!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello, again!'
          })
        ])

        const messages = await groups(db).contactMessages.query(($) => [
          $.field('ownerId').equal(ownerId)
        ])

        expect(messages.map((m) => m.data.text).sort()).toEqual([
          'Hello from Sasha!',
          'Hello from Tati!',
          'Hello, again!'
        ])

        const spy = sinon.spy()

        return new Promise((resolve) => {
          off = groups(db)
            .contactMessages.query(($) => $.field('ownerId').equal(ownerId))
            .on(async (messages) => {
              spy(messages.map((m) => m.data.text).sort())

              if (messages.length === 3) {
                await Promise.all([
                  db.contacts(sashaId).contactMessages.add({
                    ownerId,
                    author: sashaRef,
                    text: '1'
                  }),
                  db.contacts(tatiId).contactMessages.add({
                    ownerId,
                    author: tatiRef,
                    text: '2'
                  })
                ])
              } else if (messages.length === 5) {
                expect(
                  spy.calledWithMatch([
                    'Hello from Sasha!',
                    'Hello from Tati!',
                    'Hello, again!'
                  ])
                ).toBe(true)
                expect(
                  spy.calledWithMatch([
                    '1',
                    '2',
                    'Hello from Sasha!',
                    'Hello from Tati!',
                    'Hello, again!'
                  ])
                ).toBe(true)
                resolve(void 0)
              }
            })
        })
      })

      it('allows querying nested subcollection groups', async () => {
        const ownerId = await db.contacts.id()
        const messageId = await db.contacts(ownerId).contactMessages.id()

        await Promise.all([
          db.contacts(ownerId).contactMessages(messageId).messagePosts.add({
            ownerId: ownerId.toString(),
            title: 'Hello'
          }),

          db.contacts(ownerId).contactMessages(messageId).messagePosts.add({
            ownerId: ownerId.toString(),
            title: 'Hello, again!'
          })
        ])

        const spy = sinon.spy()

        return new Promise((resolve) => {
          off = groups(db)
            .messagePosts.query(($) =>
              $.field('ownerId').equal(ownerId.toString())
            )
            .on(async (posts) => {
              spy(posts.map((m) => m.data.title).sort())

              if (posts.length === 2) {
                await db
                  .contacts(sashaId)
                  .contactMessages(messageId)
                  .messagePosts.add({
                    ownerId: ownerId.toString(),
                    title: 'Hello!!!'
                  })
              } else if (posts.length === 3) {
                expect(spy.calledWithMatch(['Hello', 'Hello, again!'])).toBe(
                  true
                )
                expect(
                  spy.calledWithMatch(['Hello', 'Hello!!!', 'Hello, again!'])
                ).toBe(true)
                resolve(void 0)
              }
            })
        })
      })

      it('expands references', async () => {
        const ownerId = nanoid()
        const contactId = await db.contacts.id()

        const messageRef = await db.contacts(contactId).contactMessages.add({
          ownerId,
          author: db.contacts.ref(sashaId),
          text: 'Hola!'
        })

        await db.contacts.set(contactId, {
          ownerId,
          name: 'Sasha',
          year: 1987,
          birthday: new Date(1987, 1, 11),
          lastMessage: messageRef
        })

        return new Promise((resolve) => {
          off = groups(db)
            .contacts.query(($) => $.field('ownerId').equal(ownerId))
            .on(async (contacts) => {
              off?.()

              expect(contacts[0]?.data.lastMessage?.type).toBe('ref')
              expect(contacts[0]?.data.lastMessage?.collection.type).toBe(
                'collection'
              )
              expect(contacts[0]?.data.lastMessage?.collection.path).toBe(
                `contacts/${contactId}/contactMessages`
              )

              resolve(void 0)
            })
        })
      })

      it('allows to build query', async () => {
        const ownerId = nanoid()
        const sashaRef = db.contacts.ref(sashaId)
        const tatiRef = db.contacts.ref(tatiId)

        await Promise.all([
          db.contacts(sashaId).contactMessages.add({
            ownerId,
            author: sashaRef,
            text: 'Hello from Sasha!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello from Tati!'
          }),

          db.contacts(tatiId).contactMessages.add({
            ownerId,
            author: tatiRef,
            text: 'Hello, again!'
          })
        ])

        const $ = groups(db).contactMessages.query.build()

        $.field('ownerId').equal(ownerId)

        return new Promise((resolve) => {
          off = $.run().on((messages) => {
            off?.()

            expect(messages.map((m) => m.data.text).sort()).toEqual([
              'Hello from Sasha!',
              'Hello from Tati!',
              'Hello, again!'
            ])

            resolve(void 0)
          })
        })
      })
    })

    describe('ordering', () => {
      it('allows ordering', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('year').order('asc')
            ])
            .on((docs) => {
              spy(docs.map(({ data: { name } }) => name))
              if (spy.calledWithMatch(['Sasha', 'Tati', 'Lesha']))
                resolve(void 0)
            })
        }))

      it('allows ordering by desc', (done) => {
        const spy = sinon.spy()
        off = db.contacts
          .query(($) => [
            $.field('ownerId').equal(ownerId),
            $.field('year').order('desc')
          ])
          .on((docs) => {
            spy(docs.map(({ data: { name } }) => name))
            if (spy.calledWithMatch(['Lesha', 'Tati', 'Sasha'])) done()
          })
      })

      it('allows ordering by references', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()
          off = db.messages
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('author').order('desc'),
              $.field('text').order()
            ])
            .on(async (docs) => {
              const messagesLog = await Promise.all(
                docs.map((doc) =>
                  doc.data.author
                    .get()
                    .then(
                      (contact) => `${contact!.data.name}: ${doc.data.text}`
                    )
                )
              )
              spy(messagesLog)
              if (
                spy.calledWithMatch([
                  'Tati: wut',
                  'Sasha: +1',
                  'Sasha: lul',
                  'Lesha: +1'
                ])
              )
                resolve(void 0)
            })
        }))

      it('allows ordering by date', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('birthday').order('asc')
            ])
            .on((docs) => {
              spy(docs.map(({ data: { name } }) => name))
              if (spy.calledWithMatch(['Sasha', 'Tati', 'Lesha']))
                resolve(void 0)
            })
        }))
    })

    describe('limiting', () => {
      it('allows to limit response length', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('year').order('asc'),
              $.limit(2)
            ])
            .on((docs) => {
              spy(docs.map(({ data: { name } }) => name))
              if (spy.calledWithMatch(['Sasha', 'Tati'])) resolve(void 0)
            })
        }))
    })

    describe('paginating', () => {
      describe('startAfter', () => {
        let page1Off: () => void
        let page2Off: () => void

        afterEach(() => {
          page1Off && page1Off()
          page2Off && page2Off()
        })

        it('allows to paginate', () =>
          new Promise((resolve) => {
            const spyPage1 = sinon.spy()
            const spyPage2 = sinon.spy()
            page1Off = db.contacts
              .query(($) => [
                $.field('ownerId').equal(ownerId),
                $.field('year').order('asc', $.startAfter(undefined)),
                $.limit(2)
              ])
              .on((page1Docs) => {
                spyPage1(page1Docs.map(({ data: { name } }) => name))
                if (spyPage1.calledWithMatch(['Sasha', 'Tati'])) {
                  page1Off()
                  page2Off = db.contacts
                    .query(($) => [
                      $.field('ownerId').equal(ownerId),
                      $.field('year').order(
                        'asc',
                        $.startAfter(page1Docs[1]?.data.year)
                      ),
                      $.limit(2)
                    ])
                    .on((page2Docs) => {
                      spyPage2(page2Docs.map(({ data: { name } }) => name))
                      if (spyPage2.calledWithMatch(['Lesha'])) resolve(void 0)
                    })
                }
              })
          }))
      })

      describe('startAt', () => {
        it('allows to paginate', () =>
          new Promise((resolve) => {
            const spy = sinon.spy()
            off = db.contacts
              .query(($) => [
                $.field('ownerId').equal(ownerId),
                $.field('year').order('asc', $.startAt(1989)),
                $.limit(2)
              ])
              .on((docs) => {
                spy(docs.map(({ data: { name } }) => name))
                if (spy.calledWithMatch(['Tati', 'Lesha'])) resolve(void 0)
              })
          }))
      })

      describe('endBefore', () => {
        it('allows to paginate', () =>
          new Promise((resolve) => {
            const spy = sinon.spy()
            off = db.contacts
              .query(($) => [
                $.field('ownerId').equal(ownerId),
                $.field('year').order('asc', $.endBefore(1989)),
                $.limit(2)
              ])
              .on((docs) => {
                spy(docs.map(({ data: { name } }) => name))
                if (spy.calledWithMatch(['Sasha'])) resolve(void 0)
              })
          }))
      })

      describe('endAt', () => {
        it('allows to paginate', () =>
          new Promise((resolve) => {
            const spy = sinon.spy()
            off = db.contacts
              .query(($) => [
                $.field('ownerId').equal(ownerId),
                $.field('year').order('asc', $.endAt(1989)),
                $.limit(2)
              ])
              .on((docs) => {
                spy(docs.map(({ data: { name } }) => name))
                if (spy.calledWithMatch(['Sasha', 'Tati'])) resolve(void 0)
              })
          }))
      })

      it('uses asc ordering method by default', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('year').order($.startAt(1989)),
              $.limit(2)
            ])
            .on((docs) => {
              spy(docs.map(({ data: { name } }) => name))
              if (spy.calledWithMatch(['Tati', 'Lesha'])) resolve(void 0)
            })
        }))

      it('allows specify multiple cursor conditions', async () => {
        interface City {
          mapId: string
          name: string
          state: string
        }

        const db = schema(($) => ({
          cities: $.collection<City>()
        }))

        const mapId = nanoid()
        const spy = sinon.spy()

        await Promise.all([
          db.cities.add({
            mapId,
            name: 'Springfield',
            state: 'Massachusetts'
          }),
          db.cities.add({
            mapId,
            name: 'Springfield',
            state: 'Missouri'
          }),
          db.cities.add({
            mapId,
            name: 'Springfield',
            state: 'Wisconsin'
          })
        ])

        return new Promise(async (resolve) => {
          off = await db.cities
            .query(($) => [
              $.field('mapId').equal(mapId),
              $.field('name').order('asc', $.startAt('Springfield')),
              $.field('state').order('asc', $.startAt('Missouri')),
              $.limit(2)
            ])
            .on((docs) => {
              spy(docs.map(({ data: { name, state } }) => `${name}, ${state}`))
              if (
                spy.calledWithMatch([
                  'Springfield, Missouri',
                  'Springfield, Wisconsin'
                ])
              )
                resolve(void 0)
            })
        })
      })

      it('allows to combine cursors', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()

          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('year').order('asc', $.startAt(1989), $.endAt(1989)),
              $.limit(2)
            ])
            .on((docs) => {
              spy(docs.map(({ data: { name } }) => name))
              if (spy.calledWithMatch(['Tati'])) resolve(void 0)
            })
        }))

      it('allows to pass docs as cursors', () =>
        new Promise(async (resolve) => {
          const tati = await db.contacts.get(tatiId)
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('year').order('asc', $.startAt(tati!)),
              $.limit(2)
            ])
            .on((docs) => {
              off?.()
              expect(docs.map(({ data: { name } }) => name)).toEqual([
                'Tati',
                'Lesha'
              ])
              resolve(void 0)
            })
        }))

      it('allows using dates as cursors', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('birthday').order(
                'asc',
                $.startAt(new Date(1989, 6, 10))
              ),
              $.limit(2)
            ])
            .on((docs) => {
              spy(docs.map(({ data: { name } }) => name))
              if (spy.calledWithMatch(['Tati', 'Lesha'])) resolve(void 0)
            })
        }))
    })

    describe('docId', () => {
      interface Counter {
        n: number
      }

      const db = schema(($) => ({
        shardedCounters: $.collection<Counter>()
      }))

      beforeAll(() =>
        Promise.all([
          db.shardedCounters.set(db.shardedCounters.id('draft-0'), { n: 0 }),
          db.shardedCounters.set(db.shardedCounters.id('draft-1'), { n: 0 }),
          db.shardedCounters.set(db.shardedCounters.id('published-0'), {
            n: 0
          }),
          db.shardedCounters.set(db.shardedCounters.id('published-1'), {
            n: 0
          }),
          db.shardedCounters.set(db.shardedCounters.id('suspended-0'), {
            n: 0
          }),
          db.shardedCounters.set(db.shardedCounters.id('suspended-1'), {
            n: 0
          })
        ])
      )

      it('allows to query by documentId', () =>
        new Promise(async (resolve) => {
          const spy = sinon.spy()

          off = db.shardedCounters
            .query(($) => [
              $.field($.docId()).moreOrEqual(
                db.shardedCounters.id('published')
              ),
              $.field($.docId()).less(db.shardedCounters.id('publishee'))
            ])
            .on((docs) => {
              spy(docs.map((doc) => doc.ref.id))
              if (spy.calledWithMatch(['published-0', 'published-1']))
                resolve(void 0)
            })
        }))

      // NOTE: For some reason, my Firestore instance fails to add a composite
      // index for that, so I have do disable this in the system tests.
      // @kossnocorp
      //   if (process.env.FIRESTORE_EMULATOR_HOST) {
      it('allows ordering by documentId', () => {
        const offs: Array<() => void> = []

        return Promise.all([
          // NOTE: At the moment descending order is not supported:
          // https://stackoverflow.com/a/52119324
          // new Promise((resolve) => {
          //   const spy = sinon.spy()
          //   offs.push(
          //     db.shardedCounters
          //       .query(($) => [
          //         $.where($.docId(), '>=', 'published'),
          //         $.where($.docId(), '<', 'publishee'),
          //         $.order($.docId(), 'desc')
          //       ])
          //       .on((descend) => {
          //         spy(descend.map((doc) => doc.ref.id))
          //         if (spy.calledWithMatch(['published-1', 'published-0']))
          //           resolve(void 0)
          //       })
          //   )
          // }),

          new Promise((resolve) => {
            const spy = sinon.spy()
            offs.push(
              db.shardedCounters
                .query(($) => [
                  $.field($.docId()).moreOrEqual(
                    db.shardedCounters.id('published')
                  ),
                  $.field($.docId()).less(db.shardedCounters.id('publishee')),
                  $.field($.docId()).order('asc')
                ])
                .on((ascend) => {
                  spy(ascend.map((doc) => doc.ref.id))
                  if (spy.calledWithMatch(['published-0', 'published-1']))
                    resolve(void 0)
                })
            )
          })
        ])
      })
      //   }

      it('allows cursors to use documentId', () =>
        new Promise((resolve) => {
          const spy = sinon.spy()
          off = db.shardedCounters
            .query(($) => [
              $.field($.docId()).order(
                'asc',
                $.startAt(db.shardedCounters.id('draft-1')),
                $.endAt(db.shardedCounters.id('published-1'))
              )
            ])
            .on((docs) => {
              spy(docs.map((doc) => doc.ref.id))
              if (
                spy.calledWithMatch(['draft-1', 'published-0', 'published-1'])
              )
                resolve(void 0)
            })
        }))
    })

    describe('empty', () => {
      it('should notify with values all indicate empty', () =>
        new Promise((resolve) => {
          interface Penguin {
            ability: string[]
          }

          const db = schema(($) => ({
            penguins: $.collection<Penguin>()
          }))

          off = db.penguins
            .query(($) => $.field('ability').contains('fly'))
            .on((docs, { changes, empty }) => {
              expect(empty).toBeTruthy()
              expect(docs.length).toBe(0)
              expect(changes().length).toBe(0)
              resolve(void 0)
            })
        }))
    })

    describe('real-time', () => {
      const theoId = db.contacts.id('theo-${ownerId}')
      const harryId = db.contacts.id('harry-${ownerId}')
      const ronId = db.contacts.id('ron-${ownerId}')

      afterEach(() =>
        Promise.all([
          setLesha(),
          db.contacts.remove(theoId),
          db.contacts.remove(harryId),
          db.contacts.remove(ronId)
        ])
      )

      it('subscribes to updates', () =>
        new Promise((resolve) => {
          let c = 0
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('birthday').order(
                'asc',
                $.startAt(new Date(1989, 6, 10))
              ),
              $.limit(3)
            ])
            .on(async (docs, { changes }) => {
              const names = docs.map(({ data: { name } }) => name).sort()
              const docChanges = changes()
                .map(
                  ({
                    type,
                    doc: {
                      data: { name }
                    }
                  }) => ({ type, name })
                )
                .sort((a, b) => a.name.localeCompare(b.name))

              switch (++c) {
                case 1:
                  expect(names).toEqual(['Lesha', 'Tati'])
                  expect(docChanges).toEqual([
                    { type: 'added', name: 'Lesha' },
                    { type: 'added', name: 'Tati' }
                  ])
                  await db.contacts.set(theoId, {
                    ownerId,
                    name: 'Theodor',
                    year: 2019,
                    birthday: new Date(2019, 5, 4)
                  })
                  return
                case 2:
                  expect(names).toEqual(['Lesha', 'Tati', 'Theodor'])
                  expect(docChanges).toEqual([
                    { type: 'added', name: 'Theodor' }
                  ])
                  await db.contacts.remove(leshaId)
                  return
                case 3:
                  expect(docChanges).toEqual([
                    { type: 'removed', name: 'Lesha' }
                  ])
                  resolve(void 0)
              }
            })
        }))

      //   // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
      //   if (typeof window === 'undefined') {
      it('returns function that unsubscribes from the updates', async () => {
        const spy = sinon.spy()

        const equal = (a: string[], b: string[]) =>
          a.length === b.length && a.every((v, i) => v === b[i])

        const on = (condition: (names: string[]) => boolean) =>
          new Promise((resolveCondition) => {
            off = db.contacts
              .query(($) => [
                $.field('ownerId').equal(ownerId),
                $.field('birthday').order(
                  'asc',
                  $.startAt(new Date(1989, 6, 10))
                ),
                $.limit(3)
              ])
              .on(async (docs) => {
                const names = docs.map(({ data: { name } }) => name)
                spy(names)
                if (condition(names)) resolveCondition(void 0)
              })
          })

        await on((names) => equal(names, ['Tati', 'Lesha']))
        off?.()
        const harry = await db.contacts.set(harryId, {
          ownerId,
          name: 'Harry',
          year: 1996,
          birthday: new Date(1995, 6, 2)
        })
        await harry.remove()

        setTimeout(async () => {
          await db.contacts.set(ronId, {
            ownerId,
            name: 'Ron',
            year: 1997,
            birthday: new Date(1997, 6, 2)
          })
        })

        await on((names) => equal(names, ['Tati', 'Lesha', 'Ron']))

        expect(spy.neverCalledWithMatch(['Tati', 'Lesha', 'Harry'])).toBe(true)
      })
      //   }

      it('calls onError when query is invalid', () =>
        new Promise((resolve) => {
          const onResult = sinon.spy()
          off = db.contacts
            .query(($) => [
              $.field('ownerId').equal(ownerId),
              $.field('year').more(1989),
              $.field('birthday').more(new Date(1989, 6, 10))
            ])
            .on(onResult)
            .catch((error) => {
              expect(!onResult.called).toBe(true)

              if (!(error instanceof Error)) throw new Error('Unexpected error')

              expect(
                // Node.js|browser
                /(Cannot have inequality filters on multiple properties|Invalid query)/.test(
                  error.message
                )
              ).toBe(true)

              resolve(void 0)
            })
        }))
    })
  })

  describe('request', () => {
    it('exposes the request', () => {
      const promise = db.contacts.query(($) =>
        $.field('ownerId').equal(ownerId)
      )
      expect(promise.request).toEqual({
        type: 'request',
        kind: 'query',
        path: 'contacts',
        queries: [
          {
            field: ['ownerId'],
            filter: '==',
            type: 'where',
            value: ownerId
          }
        ]
      })
    })

    it('exposes a group request', () => {
      const promise = groups(db).contacts.query(($) =>
        $.field('ownerId').equal(ownerId)
      )
      expect(promise.request).toEqual({
        type: 'request',
        kind: 'query',
        path: 'contacts',
        queries: [
          {
            field: ['ownerId'],
            filter: '==',
            type: 'where',
            value: ownerId
          }
        ],
        group: true
      })
    })
  })
})
