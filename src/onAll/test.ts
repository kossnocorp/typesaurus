import onAll from '.'
import assert from 'assert'
import set from '../set'
import { collection } from '../collection'
import { Ref, ref } from '../ref'
import get from '../get'
import clear from '../clear'
import sinon from 'sinon'

describe('onAll', () => {
  type Book = { title: string }
  type Order = { book: Ref<Book>; quantity: number; date?: Date }

  const books = collection<Book>('books')
  const orders = collection<Order>('orders')

  beforeAll(async () => {
    await Promise.all([
      set(books, 'sapiens', { title: 'Sapiens' }),
      set(books, '22laws', { title: 'The 22 Immutable Laws of Marketing' }),
      set(books, 'momtest', { title: 'The Mom Test' }),
      clear(books, 'hp1'),
      clear(books, 'hp2')
    ])
  })

  it('returns all documents in a collection', done => {
    const off = onAll(books, docs => {
      assert.deepEqual(docs.map(({ data: { title } }) => title).sort(), [
        'Sapiens',
        'The 22 Immutable Laws of Marketing',
        'The Mom Test'
      ])
      off()
      done()
    })
  })

  it('expands references', async done => {
    await Promise.all([
      set(orders, 'order1', { book: ref(books, 'sapiens'), quantity: 1 }),
      set(orders, 'order2', { book: ref(books, '22laws'), quantity: 1 })
    ])
    const off = onAll(orders, async docs => {
      assert(docs[0].data.book.__type__ === 'ref')
      const orderedBooks = await Promise.all(
        docs.map(doc => get(books, doc.data.book.id))
      )
      assert.deepEqual(
        orderedBooks.map(({ data: { title } }) => title).sort(),
        ['Sapiens', 'The 22 Immutable Laws of Marketing']
      )
      off()
      done()
    })
  })

  it('expands dates', async done => {
    const date = new Date()
    await Promise.all([
      set(orders, 'order1', { book: ref(books, 'sapiens'), quantity: 1, date }),
      set(orders, 'order2', { book: ref(books, '22laws'), quantity: 1, date })
    ])
    const off = onAll(orders, docs => {
      assert(docs[0].data.date.getTime() === date.getTime())
      assert(docs[1].data.date.getTime() === date.getTime())
      off()
      done()
    })
  })

  describe('real-time', () => {
    it('subscribes to updates', async done => {
      const spy = sinon.spy()
      const off = onAll(books, async docs => {
        const titles = docs.map(({ data: { title } }) => title).sort()
        spy(titles)

        if (titles.length === 3) {
          await set(books, 'hp1', {
            title: "Harry Potter and the Sorcerer's Stone"
          })
        } else if (titles.length === 4) {
          off()
          assert(
            spy.calledWithMatch([
              'Sapiens',
              'The 22 Immutable Laws of Marketing',
              'The Mom Test'
            ])
          )
          assert(
            spy.calledWithMatch([
              "Harry Potter and the Sorcerer's Stone",
              'Sapiens',
              'The 22 Immutable Laws of Marketing',
              'The Mom Test'
            ])
          )
          done()
        }
      })
    })

    it('returns function that unsubscribes from the updates', async done => {
      let off: () => void
      const spy = sinon.spy()
      const on = () => {
        off = onAll(books, docs => {
          const titles = docs.map(({ data: { title } }) => title).sort()
          spy(titles)
          if (titles.length === 5) {
            off()
            assert(
              spy.neverCalledWithMatch([
                "Harry Potter and the Sorcerer's Stone",
                'Sapiens',
                'The 22 Immutable Laws of Marketing',
                'The Mom Test'
              ])
            )
            assert(
              spy.calledWithMatch([
                'Harry Potter and the Chamber of Secrets',
                "Harry Potter and the Sorcerer's Stone",
                'Sapiens',
                'The 22 Immutable Laws of Marketing',
                'The Mom Test'
              ])
            )
            done()
          }
        })
      }
      on()
      off()
      await set(books, 'hp1', {
        title: "Harry Potter and the Sorcerer's Stone"
      })
      await set(books, 'hp2', {
        title: 'Harry Potter and the Chamber of Secrets'
      })
      on()
    })
  })
})
