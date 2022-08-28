import { schema, Typesaurus } from '..'

const exp = typeof jasmine !== 'undefined' ? jasmine : expect

describe('doc', () => {
  interface User {
    name: string
    createdAt: Typesaurus.ServerDate
    updatedAt?: Typesaurus.ServerDate
    birthday: Date
  }

  interface Library {
    books: Record<string, Book | undefined>
    returned: Array<Book | undefined>
  }

  interface Book {
    title: string
    attributes: Record<string, string | boolean | undefined>
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    libraries: $.collection<Library>()
  }))

  it('creates doc object', () => {
    const createdAt = new Date() as Typesaurus.ServerDate
    const birthday = new Date(1987, 1, 11)
    const userDoc = db.users.doc(db.users.id('42'), {
      name: 'Sasha',
      createdAt,
      birthday
    })

    expect(userDoc).toEqual(
      exp.objectContaining({
        type: 'doc',
        ref: exp.objectContaining({
          type: 'ref',
          id: '42',
          collection: exp.objectContaining({
            type: 'collection',
            path: 'users'
          })
        }),
        data: { name: 'Sasha', createdAt, birthday }
      })
    )

    expect(userDoc.environment).toBe(
      typeof window === 'undefined' ? 'server' : 'client'
    )
  })

  it('converts all undefined to null', async () => {
    const doc = db.libraries.doc(await db.libraries.id(), {
      books: {
        '1984': {
          title: '1984',
          attributes: {
            hopeless: true,
            resolution: undefined
          }
        },
        'this-bright-future': undefined
      },
      returned: [
        undefined,
        {
          title: 'Brave New World',
          attributes: {
            hopeless: true,
            resolution: undefined
          }
        }
      ]
    })

    expect(doc.data).toEqual({
      books: {
        '1984': {
          title: '1984',
          attributes: {
            hopeless: true,
            resolution: null
          }
        },
        'this-bright-future': null
      },
      returned: [
        null,
        {
          title: 'Brave New World',
          attributes: {
            hopeless: true,
            resolution: null
          }
        }
      ]
    })
  })
})
