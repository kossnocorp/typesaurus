import assert from 'assert'
import nanoid from 'nanoid'
import add from '../add'
import where from '../where'
import limit from '../limit'
import onQuery from '.'
import { collection } from '../collection'
import order from '../order'
import { startAfter, startAt, endBefore, endAt } from '../cursor'
import { Ref, ref } from '../ref'
import { Doc } from '../doc'
import get from '../get'
import set from '../set'
import sinon from 'sinon'
import clear from '../clear'
import { subcollection } from '../subcollection'
import { group } from '../group'

describe('onQuery', () => {
  type Contact = { ownerId: string; name: string; year: number; birthday: Date }
  type Message = { ownerId: string; author: Ref<Contact>; text: string }

  const contacts = collection<Contact>('contacts')
  const messages = collection<Message>('messages')

  const ownerId = nanoid()

  let lesha: Doc<Contact>
  let sasha: Doc<Contact>
  let tati: Doc<Contact>

  beforeAll(async () => {
    lesha = await set(contacts, `lesha-${ownerId}`, {
      ownerId,
      name: 'Lesha',
      year: 1995,
      birthday: new Date(1995, 6, 2)
    })
    sasha = await set(contacts, `sasha-${ownerId}`, {
      ownerId,
      name: 'Sasha',
      year: 1987,
      birthday: new Date(1987, 1, 11)
    })
    tati = await set(contacts, `tati-${ownerId}`, {
      ownerId,
      name: 'Tati',
      year: 1989,
      birthday: new Date(1989, 6, 10)
    })

    await Promise.all([
      add(messages, { ownerId, author: sasha.ref, text: '+1' }),
      add(messages, { ownerId, author: lesha.ref, text: '+1' }),
      add(messages, { ownerId, author: tati.ref, text: 'wut' }),
      add(messages, { ownerId, author: sasha.ref, text: 'lul' })
    ])
  })

  it('queries documents', done => {
    const off = onQuery(contacts, [where('ownerId', '==', ownerId)], docs => {
      assert.deepEqual(docs.map(({ data: { name } }) => name).sort(), [
        'Lesha',
        'Sasha',
        'Tati'
      ])
      off()
      done()
    })
  })

  it('allows to query by value in maps', async done => {
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
    const off = onQuery(
      locations,
      [
        where('mapId', '==', mapId),
        where(['address', 'city'], '==', 'New York')
      ],
      docs => {
        assert.deepEqual(docs.map(({ data: { name } }) => name).sort(), [
          'Bagels Tower',
          'Pizza City'
        ])
        off()
        done()
      }
    )
  })

  it('expands references', done => {
    const off = onQuery(
      messages,
      [where('ownerId', '==', ownerId), where('text', '==', '+1')],
      async docs => {
        assert(docs[0].data.author.__type__ === 'ref')
        const authors = await Promise.all(
          docs.map(doc => get(contacts, doc.data.author.id))
        )
        assert.deepEqual(authors.map(({ data: { name } }) => name).sort(), [
          'Lesha',
          'Sasha'
        ])
        off()
        done()
      }
    )
  })

  it('allows to query by reference', done => {
    const off = onQuery(
      messages,
      [where('ownerId', '==', ownerId), where('author', '==', sasha.ref)],
      docs => {
        assert.deepEqual(docs.map(doc => doc.data.text).sort(), ['+1', 'lul'])
        off()
        done()
      }
    )
  })

  it('allows to query by date', done => {
    const off = onQuery(
      contacts,
      [
        where('ownerId', '==', ownerId),
        where('birthday', '==', new Date(1987, 1, 11))
      ],
      docs => {
        assert(docs.length === 1)
        assert(docs[0].data.name === 'Sasha')
        off()
        done()
      }
    )
  })

  it('allows querying collection groups', async done => {
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
    const off = onQuery(
      allContactMessages,
      [where('ownerId', '==', ownerId)],
      async messages => {
        spy(messages.map(m => m.data.text).sort())
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
          off()
          done()
        }
      }
    )
  })

  describe('ordering', () => {
    it('allows ordering', done => {
      const off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('year', 'asc')],
        docs => {
          assert.deepEqual(docs.map(({ data: { name } }) => name), [
            'Sasha',
            'Tati',
            'Lesha'
          ])
          off()
          done()
        }
      )
    })

    it('allows ordering by desc', done => {
      const off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('year', 'desc')],
        docs => {
          assert.deepEqual(docs.map(({ data: { name } }) => name), [
            'Lesha',
            'Tati',
            'Sasha'
          ])
          off()
          done()
        }
      )
    })

    it('allows ordering by references', done => {
      const off = onQuery(
        messages,
        [
          where('ownerId', '==', ownerId),
          order('author', 'desc'),
          order('text')
        ],
        async docs => {
          const messagesLog = await Promise.all(
            docs.map(doc =>
              get(contacts, doc.data.author.id).then(
                contact => `${contact.data.name}: ${doc.data.text}`
              )
            )
          )
          assert.deepEqual(messagesLog, [
            'Tati: wut',
            'Sasha: +1',
            'Sasha: lul',
            'Lesha: +1'
          ])
          off()
          done()
        }
      )
    })

    it('allows ordering by date', done => {
      const off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('birthday', 'asc')],
        docs => {
          assert.deepEqual(docs.map(({ data: { name } }) => name), [
            'Sasha',
            'Tati',
            'Lesha'
          ])
          off()
          done()
        }
      )
    })
  })

  describe('limiting', () => {
    it('allows to limit response length', done => {
      const off = onQuery(
        contacts,
        [where('ownerId', '==', ownerId), order('year', 'asc'), limit(2)],
        docs => {
          assert.deepEqual(docs.map(({ data: { name } }) => name), [
            'Sasha',
            'Tati'
          ])
          off()
          done()
        }
      )
    })
  })

  describe('paginating', () => {
    describe('startAfter', () => {
      it('allows to paginate', done => {
        const page1Off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [startAfter(undefined)]),
            limit(2)
          ],
          page1Docs => {
            assert.deepEqual(page1Docs.map(({ data: { name } }) => name), [
              'Sasha',
              'Tati'
            ])
            page1Off()

            const page2Off = onQuery(
              contacts,
              [
                where('ownerId', '==', ownerId),
                order('year', 'asc', [startAfter(page1Docs[1].data.year)]),
                limit(2)
              ],
              page2Docs => {
                assert.deepEqual(page2Docs.map(({ data: { name } }) => name), [
                  'Lesha'
                ])
                page2Off()
                done()
              }
            )
          }
        )
      })
    })

    describe('startAt', () => {
      it('allows to paginate', done => {
        const off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [startAt(1989)]),
            limit(2)
          ],
          docs => {
            assert.deepEqual(docs.map(({ data: { name } }) => name), [
              'Tati',
              'Lesha'
            ])
            off()
            done()
          }
        )
      })
    })

    describe('endBefore', () => {
      it('allows to paginate', done => {
        const off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [endBefore(1989)]),
            limit(2)
          ],
          docs => {
            assert.deepEqual(docs.map(({ data: { name } }) => name), ['Sasha'])
            off()
            done()
          }
        )
      })
    })

    describe('endAt', () => {
      it('allows to paginate', done => {
        const off = onQuery(
          contacts,
          [
            where('ownerId', '==', ownerId),
            order('year', 'asc', [endAt(1989)]),
            limit(2)
          ],
          docs => {
            assert.deepEqual(docs.map(({ data: { name } }) => name), [
              'Sasha',
              'Tati'
            ])
            off()
            done()
          }
        )
      })
    })

    it('uses asc ordering method by default', done => {
      const off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          order('year', [startAt(1989)]),
          limit(2)
        ],
        docs => {
          assert.deepEqual(docs.map(({ data: { name } }) => name), [
            'Tati',
            'Lesha'
          ])
          off()
          done()
        }
      )
    })

    it('allows specify multiple cursor conditions', async done => {
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
      const off = await onQuery(
        cities,
        [
          where('mapId', '==', mapId),
          order('name', 'asc', [startAt('Springfield')]),
          order('state', 'asc', [startAt('Missouri')]),
          limit(2)
        ],
        docs => {
          assert.deepEqual(
            docs.map(({ data: { name, state } }) => `${name}, ${state}`),
            ['Springfield, Missouri', 'Springfield, Wisconsin']
          )
          off()
          done()
        }
      )
    }, 10000)

    it('allows to combine cursors', done => {
      const off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAt(1989), endAt(1989)]),
          limit(2)
        ],
        docs => {
          assert.deepEqual(docs.map(({ data: { name } }) => name), ['Tati'])
          off()
          done()
        }
      )
    })

    // TODO: Figure out how to use references as cursors
    // it.skip('allows to pass refs as cursors', done => {
    //   const off = onQuery(
    //     contacts,
    //     [
    //       where('ownerId', '==', ownerId),
    //       order('year', 'asc', [startAt(tati.ref)]),
    //       limit(2)
    //     ],
    //     docs => {
    //       assert.deepEqual(docs.map(({ data: { name } }) => name), [
    //         'Tati',
    //         'Lesha'
    //       ])
    //       off()
    //       done()
    //     }
    //   )
    // })

    it('allows using dates as cursors', done => {
      const off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          order('birthday', 'asc', [startAt(new Date(1989, 6, 10))]),
          limit(2)
        ],
        docs => {
          assert.deepEqual(docs.map(({ data: { name } }) => name), [
            'Tati',
            'Lesha'
          ])
          off()
          done()
        }
      )
    })
  })

  describe('real-time', () => {
    const theoId = `theo-${ownerId}`
    beforeEach(async () => {
      await set(contacts, theoId, {
        ownerId,
        name: 'Theodor',
        year: 2019,
        birthday: new Date(2019, 5, 4)
      })
    })

    afterEach(async () => {
      await clear(contacts, theoId)
    })

    it('subscribes to updates', done => {
      const spy = sinon.spy()
      const off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          // TODO: Figure out why when a timestamp is used, the order is incorrect
          // order('birthday', 'asc', [startAt(new Date(1989, 6, 10))]),
          order('year', 'asc', [startAt(1989)]),
          limit(3)
        ],
        async docs => {
          const names = docs.map(({ data: { name } }) => name)
          spy(names)
          if (names.length === 3) {
            await clear(lesha.ref)
          } else if (names.length === 2) {
            assert(spy.calledWithMatch(['Tati', 'Lesha', 'Theodor']))
            assert(spy.calledWithMatch(['Tati', 'Theodor']))
            off()
            done()
          }
        }
      )
    })

    it('returns function that unsubscribes from the updates', async done => {
      let off: () => void
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
          async docs => {
            const names = docs.map(({ data: { name } }) => name)
            spy(names)
            if (names.length === 2) {
              assert(spy.neverCalledWithMatch(['Tati', 'Lesha', 'Theodor']))
              assert(spy.calledWithMatch(['Tati', 'Theodor']))
              off()
              done()
            }
          }
        )
      }
      on()
      off()
      await clear(lesha.ref)
      on()
    }, 10000)

    it('calls onError when query is invalid', done => {
      const onResult = sinon.spy()
      const off = onQuery(
        contacts,
        [
          where('ownerId', '==', ownerId),
          where('year', '>', 1989),
          where('birthday', '>', new Date(1989, 6, 10))
        ],
        onResult,
        err => {
          assert(!onResult.called)
          assert(
            err.message.match(
              /Cannot have inequality filters on multiple properties: birthday/
            )
          )
          off()
          done()
        }
      )
    })
  })
})
