import all from '.'
import assert from 'assert'
import set from '../set'
import { collection } from '../collection'

describe('all', () => {
  type Book = { title: string }
  const books = collection<Book>('books')

  beforeAll(async () => {
    await Promise.all([
      set(books, 'sapiens', { title: 'Sapiens' }),
      set(books, '22laws', { title: 'The 22 Immutable Laws of Marketing' }),
      set(books, 'momtest', { title: 'The Mom Test' })
    ])
  })

  it('returns all documents in a collection', async () => {
    const docs = await all(books)
    assert.deepEqual(docs.map(({ data: { title } }) => title).sort(), [
      'Sapiens',
      'The 22 Immutable Laws of Marketing',
      'The Mom Test'
    ])
  })
})
