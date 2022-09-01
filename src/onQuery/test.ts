import assert from 'assert'
import { sweep } from 'js-fns'
import { nanoid } from 'nanoid'
import sinon from 'sinon'
import { onQuery } from '.'
import { add } from '../add'
import { collection } from '../collection'
import { endAt, endBefore, startAfter, startAt } from '../cursor'
import { docId } from '../docId'
import { get } from '../get'
import { group } from '../group'
import { limit } from '../limit'
import { order } from '../order'
import { Ref, ref } from '../ref'
import { remove } from '../remove'
import { set } from '../set'
import { subcollection } from '../subcollection'
import { where } from '../where'

describe('onQuery', () => {
  type Contact = { ownerId: string; name: string; year: number; birthday: Date }
  type Message = { ownerId: string; author: Ref<Contact>; text: string }

  const contacts = collection<Contact>('contacts')
  const messages = collection<Message>('messages')

  let ownerId: string
  let leshaId: string
  let sashaId: string
  let tatiId: string

  let off: (() => void) | undefined

  function setLesha() {
    return set(contacts, leshaId, {
      ownerId,
      name: 'Lesha',
      year: 1995,
      birthday: new Date(1995, 6, 2)
    })
  }

  beforeEach(async () => {
    ownerId = nanoid()
    leshaId = `lesha-${ownerId}`
    sashaId = `sasha-${ownerId}`
    tatiId = `tati-${ownerId}`

    return Promise.all([
      setLesha(),
      set(contacts, sashaId, {
        ownerId,
        name: 'Sasha',
        year: 1987,
        birthday: new Date(1987, 1, 11)
      }),
      set(contacts, tatiId, {
        ownerId,
        name: 'Tati',
        year: 1989,
        birthday: new Date(1989, 6, 10)
      })
    ])
  })

  afterEach(() => {
    off && off()
    off = undefined
  })

  it('queries documents', (done) => {
    const spy = sinon.spy()
    off = onQuery(contacts, [where('ownerId', '==', ownerId)], (docs) => {
      spy(docs.map(({ data: { name } }) => name).sort())
      if (spy.calledWithMatch(['Lesha', 'Sasha', 'Tati'])) done()
    })
  })

  it('allows to query by value in maps', async () => {
    const spy = sinon.spy()
    type Location = { mapId: string; name: string; address: { city: string } }
    const locations = collection<Location>('locations')
    const mapId = nanoid()
    await Promise.all([
      add(locations, {
        mapId,
        name: 'Pizza City',
        address: { city: 'New York' }
      }),
      add(locations, {
        mapId,
        name: 'Bagels Tower',
        address: { city: 'New York' }
      }),
      add(locations, {
        mapId,
        name: 'Tacos Cave',
        address: { city: 'Houston' }
      })
    ])
    return new Promise((resolve) => {
      off = onQuery(
        locations,
        [
          where('mapId', '==', mapId),
          where(['address', 'city'], '==', 'New York')
        ],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name).sort())
          if (spy.calledWithMatch(['Bagels Tower', 'Pizza City']))
            resolve(void 0)
        }
      )
    })
  })

  it('allows to query using array-contains filter', async () => {
    const spy = sinon.spy()
    type Tag = 'pets' | 'cats' | 'dogs' | 'food' | 'hotdogs'
    type Post = { blogId: string; title: string; tags: Tag[] }
    const posts = collection<Post>('posts')
    const blogId = nanoid()
    await Promise.all([
      add(posts, {
        blogId,
        title: 'Post about cats',
        tags: ['pets', 'cats']
      }),
      add(posts, {
        blogId,
        title: 'Post about dogs',
        tags: ['pets', 'dogs']
      }),
      add(posts, {
        blogId,
        title: 'Post about hotdogs',
        tags: ['food', 'hotdogs']
      })
    ])
    return new Promise((resolve) => {
      off = onQuery(
        posts,
        [
          where('blogId', '==', blogId),
          where('tags', 'array-contains', 'pets')
        ],
        (docs) => {
          spy(docs.map(({ data: { title } }) => title).sort())
          if (spy.calledWithMatch(['Post about cats', 'Post about dogs']))
            resolve(void 0)
        }
      )
    })
  })

  it('allows to query using in filter', async () => {
    const spy = sinon.spy()
    type Pet = {
      ownerId: string
      name: string
      type: 'dog' | 'cat' | 'parrot' | 'snake'
    }
    const pets = collection<Pet>('pets')
    const ownerId = nanoid()
    await Promise.all([
      add(pets, {
        ownerId,
        name: 'Persik',
        type: 'dog'
      }),
      add(pets, {
        ownerId,
        name: 'Kimchi',
        type: 'cat'
      }),
      add(pets, {
        ownerId,
        name: 'Snako',
        type: 'snake'
      })
    ])
    return new Promise((resolve) => {
      off = onQuery(
        pets,
        [where('ownerId', '==', ownerId), where('type', 'in', ['cat', 'dog'])],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name).sort())
          if (spy.calledWithMatch(['Kimchi', 'Persik'])) resolve(void 0)
        }
      )
    })
  })

  it('allows to query using array-contains-any filter', async () => {
    const spy = sinon.spy()
    type Tag = 'pets' | 'cats' | 'dogs' | 'wildlife' | 'food' | 'hotdogs'
    type Post = { blogId: string; title: string; tags: Tag[] }
    const posts = collection<Post>('posts')
    const blogId = nanoid()
    await Promise.all([
      add(posts, {
        blogId,
        title: 'Post about cats',
        tags: ['pets', 'cats']
      }),
      add(posts, {
        blogId,
        title: 'Post about dogs',
        tags: ['pets', 'dogs']
      }),
      add(posts, {
        blogId,
        title: 'Post about hotdogs',
        tags: ['food', 'hotdogs']
      }),
      add(posts, {
        blogId,
        title: 'Post about kangaroos',
        tags: ['wildlife']
      })
    ])
    return new Promise((resolve) => {
      off = onQuery(
        posts,
        [
          where('blogId', '==', blogId),
          where('tags', 'array-contains-any', ['pets', 'wildlife'])
        ],
        (docs) => {
          spy(docs.map(({ data: { title } }) => title).sort())
          if (
            spy.calledWithMatch([
              'Post about cats',
              'Post about dogs',
              'Post about kangaroos'
            ])
          )
            resolve(void 0)
        }
      )
    })
  })

  describe('with messages', () => {
    beforeEach(async () => {
      await Promise.all([
        add(messages, { ownerId, author: ref(contacts, sashaId), text: '+1' }),
        add(messages, { ownerId, author: ref(contacts, leshaId), text: '+1' }),
        add(messages, { ownerId, author: ref(contacts, tatiId), text: 'wut' }),
        add(messages, { ownerId, author: ref(contacts, sashaId), text: 'lul' })
      ])
    })

    it('expands references', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        messages,
        [where('ownerId', '==', ownerId), where('text', '==', '+1')],
        async (docs) => {
          const authors = await Promise.all(
            docs.map((doc) => get(contacts, doc.data.author.id))
          )
          spy(
            sweep(authors)
              .map(({ data: { name } }) => name)
              .sort()
          )
          if (spy.calledWithMatch(['Lesha', 'Sasha'])) done()
        }
      )
    })

    it('allows to query by reference', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        messages,
        [
          where('ownerId', '==', ownerId),
          where('author', '==', ref(contacts, sashaId))
        ],
        (docs) => {
          spy(docs.map((doc) => doc.data.text).sort())
          if (spy.calledWithMatch(['+1', 'lul'])) done()
        }
      )
    })

    it('allows querying collection groups', async () => {
      const ownerId = nanoid()
      const contactMessages = subcollection<Message, Contact>(
        'contactMessages',
        contacts
      )
      const sashaRef = ref(contacts, `${ownerId}-sasha`)
      const sashasContactMessages = contactMessages(sashaRef)
      add(sashasContactMessages, {
        ownerId,
        author: sashaRef,
        text: 'Hello from Sasha!'
      })
      const tatiRef = ref(contacts, `${ownerId}-tati`)
      const tatisContactMessages = contactMessages(tatiRef)
      await Promise.all([
        add(tatisContactMessages, {
          ownerId,
          author: tatiRef,
          text: 'Hello from Tati!'
        }),
        add(tatisContactMessages, {
          ownerId,
          author: tatiRef,
          text: 'Hello, again!'
        })
      ])
      const allContactMessages = group('contactMessages', [contactMessages])
      const spy = sinon.spy()
      return new Promise((resolve) => {
        off = onQuery(
          allContactMessages,
          [where('ownerId', '==', ownerId)],
          async (messages) => {
            spy(messages.map((m) => m.data.text).sort())
            if (messages.length === 3) {
              await Promise.all([
                add(sashasContactMessages, {
                  ownerId,
                  author: sashaRef,
                  text: '1'
                }),
                add(tatisContactMessages, {
                  ownerId,
                  author: tatiRef,
                  text: '2'
                })
              ])
            } else if (messages.length === 5) {
              assert(
                spy.calledWithMatch([
                  'Hello from Sasha!',
                  'Hello from Tati!',
                  'Hello, again!'
                ])
              )
              assert(
                spy.calledWithMatch([
                  '1',
                  '2',
                  'Hello from Sasha!',
                  'Hello from Tati!',
                  'Hello, again!'
                ])
              )
              resolve(void 0)
            }
          }
        )
      })
    })
  })

  it('allows to query by date', (done) => {
    off = onQuery(
      contacts,
      [
        where('ownerId', '==', ownerId),
        where('birthday', '==', new Date(1987, 1, 11))
      ],
      (docs) => {
        if (docs.length === 1 && docs[0].data.name === 'Sasha') done()
      }
    )
  })

  describe('ordering', () => {
    it('allows ordering', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('year', 'asc')],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name))
          if (spy.calledWithMatch(['Sasha', 'Tati', 'Lesha'])) done()
        }
      )
    })

    it('allows ordering by desc', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('year', 'desc')],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name))
          if (spy.calledWithMatch(['Lesha', 'Tati', 'Sasha'])) done()
        }
      )
    })

    describe('with messages', () => {
      beforeEach(() =>
        Promise.all([
          add(messages, {
            ownerId,
            author: ref(contacts, sashaId),
            text: '+1'
          }),
          add(messages, {
            ownerId,
            author: ref(contacts, leshaId),
            text: '+1'
          }),
          add(messages, {
            ownerId,
            author: ref(contacts, tatiId),
            text: 'wut'
          }),
          add(messages, {
            ownerId,
            author: ref(contacts, sashaId),
            text: 'lul'
          })
        ])
      )

      it('allows ordering by references', (done) => {
        const spy = sinon.spy()
        off = onQuery(
          messages,
          [
            where('ownerId', '==', ownerId),
            order('author', 'desc'),
            order('text')
          ],
          async (docs) => {
            const messagesLog = await Promise.all(
              docs.map((doc) =>
                get(contacts, doc.data.author.id).then(
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
              done()
          }
        )
      })
    })

    it('allows ordering by date', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('birthday', 'asc')],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name))
          if (spy.calledWithMatch(['Sasha', 'Tati', 'Lesha'])) done()
        }
      )
    })
  })

  describe('limiting', () => {
    it('allows to limit response length', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('year', 'asc'), limit(2)],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name))
          if (spy.calledWithMatch(['Sasha', 'Tati'])) done()
        }
      )
    })
  })

  describe('paginating', () => {
    describe('startAfter', () => {
      let page1Off: () => void
      let page2Off: () => void

      afterEach(() => {
        page1Off && page1Off()
        page2Off && page2Off()
      })

      it('allows to paginate', (done) => {
        const spyPage1 = sinon.spy()
        const spyPage2 = sinon.spy()
        page1Off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [startAfter(undefined)]),
            limit(2)
          ],
          (page1Docs) => {
            spyPage1(page1Docs.map(({ data: { name } }) => name))
            if (spyPage1.calledWithMatch(['Sasha', 'Tati'])) {
              page1Off()

              page2Off = onQuery(
                contacts,
                [
                  where('ownerId', '==', ownerId),
                  order('year', 'asc', [startAfter(page1Docs[1].data.year)]),
                  limit(2)
                ],
                (page2Docs) => {
                  spyPage2(page2Docs.map(({ data: { name } }) => name))
                  if (spyPage2.calledWithMatch(['Lesha'])) done()
                }
              )
            }
          }
        )
      })
    })

    describe('startAt', () => {
      it('allows to paginate', (done) => {
        const spy = sinon.spy()
        off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [startAt(1989)]),
            limit(2)
          ],
          (docs) => {
            spy(docs.map(({ data: { name } }) => name))
            if (spy.calledWithMatch(['Tati', 'Lesha'])) done()
          }
        )
      })
    })

    describe('endBefore', () => {
      it('allows to paginate', (done) => {
        const spy = sinon.spy()
        off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [endBefore(1989)]),
            limit(2)
          ],
          (docs) => {
            spy(docs.map(({ data: { name } }) => name))
            if (spy.calledWithMatch(['Sasha'])) done()
          }
        )
      })
    })

    describe('endAt', () => {
      it('allows to paginate', (done) => {
        const spy = sinon.spy()
        off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [endAt(1989)]),
            limit(2)
          ],
          (docs) => {
            spy(docs.map(({ data: { name } }) => name))
            if (spy.calledWithMatch(['Sasha', 'Tati'])) done()
          }
        )
      })
    })

    it('uses asc ordering method by default', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          order('year', [startAt(1989)]),
          limit(2)
        ],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name))
          if (spy.calledWithMatch(['Tati', 'Lesha'])) done()
        }
      )
    })

    it('allows specify multiple cursor conditions', async () => {
      const spy = sinon.spy()
      type City = { mapId: string; name: string; state: string }
      const cities = collection<City>('cities')
      const mapId = nanoid()
      await Promise.all([
        add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Massachusetts'
        }),
        add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Missouri'
        }),
        add(cities, {
          mapId,
          name: 'Springfield',
          state: 'Wisconsin'
        })
      ])
      return new Promise(async (resolve) => {
        off = await onQuery(
          cities,
          [
            where('mapId', '==', mapId),
            order('name', 'asc', [startAt('Springfield')]),
            order('state', 'asc', [startAt('Missouri')]),
            limit(2)
          ],
          (docs) => {
            spy(docs.map(({ data: { name, state } }) => `${name}, ${state}`))
            if (
              spy.calledWithMatch([
                'Springfield, Missouri',
                'Springfield, Wisconsin'
              ])
            )
              resolve(void 0)
          }
        )
      })
    })

    it('allows to combine cursors', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAt(1989), endAt(1989)]),
          limit(2)
        ],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name))
          if (spy.calledWithMatch(['Tati'])) done()
        }
      )
    })

    it('allows to pass docs as cursors', async (done) => {
      const tati = await get(contacts, tatiId)
      off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAt(tati!)]),
          limit(2)
        ],
        (docs) => {
          off?.()
          assert.deepEqual(
            docs.map(({ data: { name } }) => name),
            ['Tati', 'Lesha']
          )
          done()
        }
      )
    })

    it('allows using dates as cursors', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          order('birthday', 'asc', [startAt(new Date(1989, 6, 10))]),
          limit(2)
        ],
        (docs) => {
          spy(docs.map(({ data: { name } }) => name))
          if (spy.calledWithMatch(['Tati', 'Lesha'])) done()
        }
      )
    })
  })

  describe('docId', () => {
    type Counter = { n: number }
    const shardedCounters = collection<Counter>('shardedCounters')

    it('allows to query by documentId', async (done) => {
      await Promise.all([
        set(shardedCounters, `draft-0`, { n: 0 }),
        set(shardedCounters, `draft-1`, { n: 0 }),
        set(shardedCounters, `published-0`, { n: 0 }),
        set(shardedCounters, `published-1`, { n: 0 }),
        set(shardedCounters, `suspended-0`, { n: 0 }),
        set(shardedCounters, `suspended-1`, { n: 0 })
      ])

      const spy = sinon.spy()
      off = onQuery(
        shardedCounters,
        [where(docId, '>=', 'published'), where(docId, '<', 'publishee')],
        (docs) => {
          spy(docs.map((doc) => doc.ref.id))
          if (spy.calledWithMatch(['published-0', 'published-1'])) done()
        }
      )
    })

    // NOTE: For some reason, my Firestore instance fails to add a composite
    // index for that, so I have do disable this in the system tests.
    // @kossnocorp
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      it('allows ordering by documentId', () => {
        const offs: Array<() => void> = []
        return Promise.all([
          new Promise((resolve) => {
            const spy = sinon.spy()
            offs.push(
              onQuery(
                shardedCounters,
                [
                  where(docId, '>=', 'published'),
                  where(docId, '<', 'publishee'),
                  order(docId, 'desc')
                ],
                (descend) => {
                  spy(descend.map((doc) => doc.ref.id))
                  if (spy.calledWithMatch(['published-1', 'published-0']))
                    resolve(void 0)
                }
              )
            )
          }),

          new Promise((resolve) => {
            const spy = sinon.spy()
            offs.push(
              onQuery(
                shardedCounters,
                [
                  where(docId, '>=', 'published'),
                  where(docId, '<', 'publishee'),
                  order(docId, 'asc')
                ],
                (ascend) => {
                  spy(ascend.map((doc) => doc.ref.id))
                  if (spy.calledWithMatch(['published-0', 'published-1']))
                    resolve(void 0)
                }
              )
            )
          })
        ])
      })
    }

    it('allows cursors to use documentId', (done) => {
      const spy = sinon.spy()
      off = onQuery(
        shardedCounters,
        [order(docId, 'asc', [startAt('draft-1'), endAt('published-1')])],
        (docs) => {
          spy(docs.map((doc) => doc.ref.id))
          if (spy.calledWithMatch(['draft-1', 'published-0', 'published-1']))
            done()
        }
      )
    })
  })

  describe('empty', () => {
    it('should notify with values all indicate empty', (done) => {
      off = onQuery(
        collection<{ ability: string[] }>('penguin'),
        [where('ability', 'array-contains', 'fly')],
        (docs, { changes, empty }) => {
          expect(empty).toBeTruthy()
          assert(docs.length === 0)
          expect(changes().length === 0)
          done()
        }
      )
    })
  })

  describe('real-time', () => {
    const theoId = `theo-${ownerId}`

    afterEach(async () => {
      await remove(contacts, theoId)
    })

    it('subscribes to updates', (done) => {
      let c = 0
      off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          // TODO: Figure out why when a timestamp is used, the order is incorrect
          // order('birthday', 'asc', [startAt(new Date(1989, 6, 10))]),
          order('year', 'asc', [startAt(1989)]),
          limit(3)
        ],
        async (docs, { changes }) => {
          const names = docs.map(({ data: { name } }) => name).sort()
          const docChanges = changes()
            .map(({ type, doc: { data: { name } } }) => ({ type, name }))
            .sort((a, b) => a.name.localeCompare(b.name))

          switch (++c) {
            case 1:
              expect(names).toEqual(['Lesha', 'Tati'])
              expect(docChanges).toEqual([
                { type: 'added', name: 'Lesha' },
                { type: 'added', name: 'Tati' }
              ])
              await set(contacts, theoId, {
                ownerId,
                name: 'Theodor',
                year: 2019,
                birthday: new Date(2019, 5, 4)
              })
              return
            case 2:
              expect(names).toEqual(['Lesha', 'Tati', 'Theodor'])
              expect(docChanges).toEqual([{ type: 'added', name: 'Theodor' }])
              await remove(contacts, leshaId)
              return
            case 3:
              expect(docChanges).toEqual([{ type: 'removed', name: 'Theodor' }])
              done()
          }
        }
      )
    })

    // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
    // TODO: For whatever reason this test fails within the emulator environment
    if (typeof window === 'undefined' && !process.env.FIRESTORE_EMULATOR_HOST) {
      it('returns function that unsubscribes from the updates', () => {
        return new Promise(async (resolve) => {
          const spy = sinon.spy()
          const on = () => {
            off = onQuery(
              contacts,
              [
                where('ownerId', '==', ownerId),
                // TODO: Figure out why when a timestamp is used, the order is incorrect
                // order('birthday', 'asc', [startAt(new Date(1989, 6, 10))]),
                order('year', 'asc', [startAt(1989)]),
                limit(3)
              ],
              async (docs) => {
                const names = docs.map(({ data: { name } }) => name)
                spy(names)

                if (
                  spy.calledWithMatch(['Tati', 'Theodor']) &&
                  spy.neverCalledWithMatch(['Tati', 'Lesha', 'Theodor'])
                )
                  resolve(void 0)
              }
            )
          }
          on()
          off?.()
          await remove(contacts, leshaId)
          on()
        })
      })
    }

    // TODO: For whatever reason this test fails within the emulator environment
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      it('calls onError when query is invalid', (done) => {
        const onResult = sinon.spy()
        off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            where('year', '>', 1989),
            where('birthday', '>', new Date(1989, 6, 10))
          ],
          onResult,
          (err) => {
            assert(!onResult.called)
            assert(
              // Node.js:
              err.message.match(
                /Cannot have inequality filters on multiple properties: birthday/
              ) ||
                // Browser:
                err.message.match(/Invalid query/)
            )
            done()
          }
        )
      })
    }
  })
})
