import { Typesaurus } from '..'
import { schema } from '../adaptor'

describe('all', () => {
  describe('promise', () => {
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

    it('expands references', async () => {
      await Promise.all([
        db.orders.set('order1', { book: db.books.ref('sapiens'), quantity: 1 }),
        db.orders.set('order2', { book: db.books.ref('22laws'), quantity: 1 })
      ])
      const docs = await db.orders.all()
      expect(docs[0]?.data.book.type).toBe('ref')
      const orderedBooks = await Promise.all(
        docs.map((doc) => doc.data.book.get())
      )
      expect(orderedBooks.map((doc) => doc?.data.title).sort()).toEqual([
        'Sapiens',
        'The 22 Immutable Laws of Marketing'
      ])
    })

    it('expands dates', async () => {
      const date = new Date(1987, 1, 11)
      await Promise.all([
        db.orders.set('order1', {
          book: db.books.ref('sapiens'),
          quantity: 1,
          date
        }),
        db.orders.set('order2', {
          book: db.books.ref('22laws'),
          quantity: 1,
          date
        })
      ])
      const docs = await db.orders.all()
      expect(docs[0]?.data.date?.getTime()).toBe(date.getTime())
      expect(docs[1]?.data.date?.getTime()).toBe(date.getTime())
    })

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

  describe('subscription', () => {
    // type Book = { title: string }
    // type Order = { book: Ref<Book>; quantity: number; date?: Date }
    // const books = collection<Book>('books')
    // const orders = collection<Order>('orders')
    // beforeEach(async () => {
    //   await Promise.all([
    //     set(books, 'sapiens', { title: 'Sapiens' }),
    //     set(books, '22laws', { title: 'The 22 Immutable Laws of Marketing' }),
    //     set(books, 'momtest', { title: 'The Mom Test' }),
    //     remove(books, 'hp1'),
    //     remove(books, 'hp2')
    //   ])
    // })
    // let off: (() => void) | undefined
    // afterEach(() => {
    //   off && off()
    //   off = undefined
    // })
    // it('returns all documents in a collection', (done) => {
    //   const spy = sinon.spy()
    //   off = onAll(books, (docs) => {
    //     spy(docs.map(({ data: { title } }) => title).sort())
    //     if (
    //       spy.calledWithMatch([
    //         'Sapiens',
    //         'The 22 Immutable Laws of Marketing',
    //         'The Mom Test'
    //       ])
    //     )
    //       done()
    //   })
    // })
    // it('expands references', async () => {
    //   await Promise.all([
    //     set(orders, 'order1', { book: ref(books, 'sapiens'), quantity: 1 }),
    //     set(orders, 'order2', { book: ref(books, '22laws'), quantity: 1 })
    //   ])
    //   return new Promise((resolve) => {
    //     const spy = sinon.spy()
    //     off = onAll(orders, async (docs) => {
    //       off?.()
    //       const orderedBooks = await Promise.all(
    //         docs.map((doc) => get(books, doc.data.book.id))
    //       )
    //       spy(orderedBooks.map((doc) => doc?.data.title).sort())
    //       if (
    //         spy.calledWithMatch([
    //           'Sapiens',
    //           'The 22 Immutable Laws of Marketing'
    //         ])
    //       )
    //         resolve(void 0)
    //     })
    //   })
    // })
    // it('expands dates', async () => {
    //   const date = new Date()
    //   await Promise.all([
    //     set(orders, 'order1', {
    //       book: ref(books, 'sapiens'),
    //       quantity: 1,
    //       date
    //     }),
    //     set(orders, 'order2', { book: ref(books, '22laws'), quantity: 1, date })
    //   ])
    //   return new Promise((resolve) => {
    //     off = onAll(orders, (docs) => {
    //       if (docs.length === 2 && docs[0].data.date && docs[1].data.date) {
    //         off?.()
    //         if (typeof window === undefined) {
    //           assert(docs[0].data.date.getTime() === date.getTime())
    //           assert(docs[1].data.date.getTime() === date.getTime())
    //         } else {
    //           // TODO: WTF, Node.js and browser dates are processed differently
    //           assert(docs[0].data.date.getTime() - date.getTime() < 20000)
    //           assert(docs[1].data.date.getTime() - date.getTime() < 20000)
    //         }
    //         resolve(void 0)
    //       }
    //     })
    //   })
    // })
    // it('allows to get all data from collection groups', async () => {
    //   const commentsGroupName = `comments-${nanoid()}`
    //   type Comment = { text: string }
    //   const bookComments = subcollection<Comment, Book>(
    //     commentsGroupName,
    //     books
    //   )
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
    //   const allComments = group(commentsGroupName, [
    //     bookComments,
    //     orderComments
    //   ])
    //   return new Promise((resolve) => {
    //     off = onAll(allComments, (comments) => {
    //       if (comments.length === 3) {
    //         off?.()
    //         assert.deepEqual(comments.map((c) => c.data.text).sort(), [
    //           'cruel',
    //           'hello',
    //           'world'
    //         ])
    //         resolve(void 0)
    //       }
    //     })
    //   })
    // })
    // describe('empty', () => {
    //   it('should notify with values all indicate empty', (done) => {
    //     off = onAll(collection('void'), (docs, { changes, empty }) => {
    //       expect(empty).toBeTruthy()
    //       assert(docs.length === 0)
    //       expect(changes().length === 0)
    //       done()
    //     })
    //   })
    // })
    // describe('real-time', () => {
    //   it('subscribes to updates', (done) => {
    //     let c = 0
    //     off = onAll(books, async (docs, { changes }) => {
    //       const titles = docs.map(({ data: { title } }) => title).sort()
    //       const docChanges = changes()
    //         .map(
    //           ({
    //             type,
    //             doc: {
    //               data: { title }
    //             }
    //           }) => ({ type, title })
    //         )
    //         .sort((a, b) => a.title.localeCompare(b.title))
    //       switch (++c) {
    //         case 1:
    //           expect(titles).toEqual([
    //             'Sapiens',
    //             'The 22 Immutable Laws of Marketing',
    //             'The Mom Test'
    //           ])
    //           expect(docChanges).toEqual([
    //             { type: 'added', title: 'Sapiens' },
    //             { type: 'added', title: 'The 22 Immutable Laws of Marketing' },
    //             { type: 'added', title: 'The Mom Test' }
    //           ])
    //           await set(books, 'hp1', {
    //             title: "Harry Potter and the Sorcerer's Stone"
    //           })
    //           return
    //         case 2:
    //           expect(titles).toEqual([
    //             "Harry Potter and the Sorcerer's Stone",
    //             'Sapiens',
    //             'The 22 Immutable Laws of Marketing',
    //             'The Mom Test'
    //           ])
    //           expect(docChanges).toEqual([
    //             {
    //               type: 'added',
    //               title: "Harry Potter and the Sorcerer's Stone"
    //             }
    //           ])
    //           done()
    //       }
    //     })
    //   })
    //   // TODO: WTF browser Firebase returns elements gradually unlike Node.js version.
    //   if (typeof window === undefined) {
    //     it('returns function that unsubscribes from the updates', () => {
    //       return new Promise(async (resolve) => {
    //         const spy = sinon.spy()
    //         const on = () => {
    //           off = onAll(books, (docs) => {
    //             const titles = docs.map(({ data: { title } }) => title).sort()
    //             spy(titles)
    //             if (titles.length === 5) {
    //               off?.()
    //               assert(
    //                 spy.neverCalledWithMatch([
    //                   "Harry Potter and the Sorcerer's Stone",
    //                   'Sapiens',
    //                   'The 22 Immutable Laws of Marketing',
    //                   'The Mom Test'
    //                 ])
    //               )
    //               assert(
    //                 spy.calledWithMatch([
    //                   'Harry Potter and the Chamber of Secrets',
    //                   "Harry Potter and the Sorcerer's Stone",
    //                   'Sapiens',
    //                   'The 22 Immutable Laws of Marketing',
    //                   'The Mom Test'
    //                 ])
    //               )
    //               resolve(void 0)
    //             }
    //           })
    //         }
    //         on()
    //         off?.()
    //         await set(books, 'hp1', {
    //           title: "Harry Potter and the Sorcerer's Stone"
    //         })
    //         await set(books, 'hp2', {
    //           title: 'Harry Potter and the Chamber of Secrets'
    //         })
    //         on()
    //       })
    //     })
    //   }
    // })
  })
})
