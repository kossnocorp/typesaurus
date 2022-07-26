import { describe, beforeEach, expect, it } from 'vitest'
import { Typesaurus } from '..'
import { schema } from '../adaptor/admin'

describe('all', () => {
  interface Book {
    title: string
  }

  interface Order {
    book: Typesaurus.Ref<Book>
    quantity: number
    date?: Date
  }

  const db = schema(($) => ({
    books: $.collection<Book>(),
    orders: $.collection<Order>()
  }))

  beforeEach(async () => {
    await Promise.all([
      db.books.set('sapiens', { title: 'Sapiens' }),
      db.books.set('22laws', { title: 'The 22 Immutable Laws of Marketing' }),
      db.books.set('momtest', { title: 'The Mom Test' }),
      db.books.remove('hp1'),
      db.books.remove('hp2')
    ])
  })

  it('returns all documents in a collection', async () => {
    const docs = await db.books.all()
    expect(docs.map(({ data: { title } }) => title).sort()).toEqual([
      'Sapiens',
      'The 22 Immutable Laws of Marketing',
      'The Mom Test'
    ])
  })

  // it('expands references', async () => {
  //   await Promise.all([
  //     db.orders.set('order1', { book: db.books.ref('sapiens'), quantity: 1 }),
  //     db.orders.set('order2', { book: db.books.ref('22laws'), quantity: 1 })
  //   ])
  //   const docs = await db.orders.all()
  //   expect(docs[0]?.data.book.type).toBe('ref')
  //   const orderedBooks = await Promise.all(
  //     docs.map((doc) => get(books, doc.data.book.id))
  //   )
  //   expect(orderedBooks.map((doc) => doc?.data.title).sort()).toEqual([
  //     'Sapiens',
  //     'The 22 Immutable Laws of Marketing'
  //   ])
  // })

  // it('expands dates', async () => {
  //   const date = new Date(1987, 1, 11)
  //   await Promise.all([
  //     set(orders, 'order1', { book: ref(books, 'sapiens'), quantity: 1, date }),
  //     set(orders, 'order2', { book: ref(books, '22laws'), quantity: 1, date })
  //   ])
  //   const docs = await all(orders)
  //   assert(docs[0]?.data.date?.getTime() === date.getTime())
  //   assert(docs[1]?.data.date?.getTime() === date.getTime())
  // })

  // it('allows to get all data from collection groups', async () => {
  //   const commentsGroupName = `comments-${nanoid()}`
  //   type Comment = { text: string }

  //   const bookComments = subcollection<Comment, Book>(commentsGroupName, books)
  //   const orderComments = subcollection<Comment, Order>(
  //     commentsGroupName,
  //     orders
  //   )

  //   await Promise.all([
  //     add(bookComments('qwe'), {
  //       text: 'hello'
  //     }),

  //     add(bookComments('asd'), {
  //       text: 'cruel'
  //     }),

  //     add(orderComments('zxc'), {
  //       text: 'world'
  //     })
  //   ])

  //   const allComments = group(commentsGroupName, [bookComments, orderComments])
  //   const comments = await all(allComments)
  //   assert.deepEqual(comments.map((c) => c.data.text).sort(), [
  //     'cruel',
  //     'hello',
  //     'world'
  //   ])
  // })
})
