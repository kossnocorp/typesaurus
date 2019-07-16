import assert from 'assert'
import nanoid from 'nanoid'
import add from '../add'
import where from '../where'
import limit from '../limit'
import query from '.'
import { collection } from '../collection'
import order from '../order'
import { startAfter, startAt, endBefore, endAt } from '../cursor'
import { Ref } from '../ref'
import { Doc } from '../doc'
import get from '../get'
import set from '../set'

describe('query', () => {
  type Contact = { ownerId: string; name: string; year: number }
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
      year: 1995
    })
    sasha = await set(contacts, `sasha-${ownerId}`, {
      ownerId,
      name: 'Sasha',
      year: 1987
    })
    tati = await set(contacts, `tati-${ownerId}`, {
      ownerId,
      name: 'Tati',
      year: 1989
    })

    await Promise.all([
      add(messages, { ownerId, author: sasha.ref, text: '+1' }),
      add(messages, { ownerId, author: lesha.ref, text: '+1' }),
      add(messages, { ownerId, author: tati.ref, text: 'wut' }),
      add(messages, { ownerId, author: sasha.ref, text: 'lul' })
    ])
  })

  it('queries documents', async () => {
    const docs = await query(contacts, [where('ownerId', '==', ownerId)])
    assert.deepEqual(docs.map(({ data: { name } }) => name).sort(), [
      'Lesha',
      'Sasha',
      'Tati'
    ])
  })

  it('allows to query by value in maps', async () => {
    type Location = { mapId: string; name: string; address: { city: string } }
    const locations = collection<Location>('locations')
    const mapId = nanoid()
    await add(locations, {
      mapId,
      name: 'Pizza City',
      address: { city: 'New York' }
    })
    await add(locations, {
      mapId,
      name: 'Bagels Tower',
      address: { city: 'New York' }
    })
    await add(locations, {
      mapId,
      name: 'Tacos Cave',
      address: { city: 'Houston' }
    })
    const docs = await query(locations, [
      where('mapId', '==', mapId),
      where(['address', 'city'], '==', 'New York')
    ])
    assert.deepEqual(docs.map(({ data: { name } }) => name).sort(), [
      'Bagels Tower',
      'Pizza City'
    ])
  })

  it('expands references', async () => {
    const docs = await query(messages, [
      where('ownerId', '==', ownerId),
      where('text', '==', '+1')
    ])
    assert(docs[0].data.author.__type__ === 'ref')
    const authors = await Promise.all(
      docs.map(doc => get(contacts, doc.data.author.id))
    )
    assert.deepEqual(authors.map(({ data: { name } }) => name).sort(), [
      'Lesha',
      'Sasha'
    ])
  })

  it('allows to query by reference', async () => {
    const docs = await query(messages, [
      where('ownerId', '==', ownerId),
      where('author', '==', sasha.ref)
    ])
    assert.deepEqual(docs.map(doc => doc.data.text).sort(), ['+1', 'lul'])
  })

  describe('ordering', () => {
    it('allows to order', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'asc')
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Sasha',
        'Tati',
        'Lesha'
      ])
    })

    it('allows to order by desc', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'desc')
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Lesha',
        'Tati',
        'Sasha'
      ])
    })

    it('allows to order by references', async () => {
      const docs = await query(messages, [
        where('ownerId', '==', ownerId),
        order('author', 'desc'),
        order('text')
      ])
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
    })
  })

  describe('limiting', () => {
    it('allows to limit response length', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'asc'),
        limit(2)
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Sasha',
        'Tati'
      ])
    })
  })

  describe('paginating', () => {
    describe('startAfter', () => {
      it('allows to paginate', async () => {
        const page1Docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAfter(undefined)]),
          limit(2)
        ])
        assert.deepEqual(page1Docs.map(({ data: { name } }) => name), [
          'Sasha',
          'Tati'
        ])
        const page2Docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAfter(page1Docs[1].data.year)]),
          limit(2)
        ])
        assert.deepEqual(page2Docs.map(({ data: { name } }) => name), ['Lesha'])
      })
    })

    describe('startAt', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [startAt(1989)]),
          limit(2)
        ])
        assert.deepEqual(docs.map(({ data: { name } }) => name), [
          'Tati',
          'Lesha'
        ])
      })
    })

    describe('endBefore', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [endBefore(1989)]),
          limit(2)
        ])
        assert.deepEqual(docs.map(({ data: { name } }) => name), ['Sasha'])
      })
    })

    describe('endAt', () => {
      it('allows to paginate', async () => {
        const docs = await query(contacts, [
          where('ownerId', '==', ownerId),
          order('year', 'asc', [endAt(1989)]),
          limit(2)
        ])
        assert.deepEqual(docs.map(({ data: { name } }) => name), [
          'Sasha',
          'Tati'
        ])
      })
    })

    it('uses asc ordering method by default', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', [startAt(1989)]),
        limit(2)
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), [
        'Tati',
        'Lesha'
      ])
    })

    it('allows specify multiple cursor conditions', async () => {
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
      const docs = await query(cities, [
        where('mapId', '==', mapId),
        order('name', 'asc', [startAt('Springfield')]),
        order('state', 'asc', [startAt('Missouri')]),
        limit(2)
      ])
      assert.deepEqual(
        docs.map(({ data: { name, state } }) => `${name}, ${state}`),
        ['Springfield, Missouri', 'Springfield, Wisconsin']
      )
    }, 10000)

    it('allows to combine cursors', async () => {
      const docs = await query(contacts, [
        where('ownerId', '==', ownerId),
        order('year', 'asc', [startAt(1989), endAt(1989)]),
        limit(2)
      ])
      assert.deepEqual(docs.map(({ data: { name } }) => name), ['Tati'])
    })

    // TODO: Figure out how to use references as cursors
    // it.skip('allows to pass refs as cursors', async () => {
    //   const docs = await query(contacts, [
    //     where('ownerId', '==', ownerId),
    //     order('year', 'asc', [startAt(tati.ref)]),
    //     limit(2)
    //   ])
    //   assert.deepEqual(docs.map(({ data: { name } }) => name), [
    //     'Tati',
    //     'Lesha'
    //   ])
    // })
  })
})
