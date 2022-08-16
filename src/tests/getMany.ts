import { schema, Typesaurus } from '..'

describe('getMany', () => {
  interface Fruit {
    color: string
  }

  interface Fly {
    color: string
  }

  const db = schema(($) => ({
    fruits: $.collection<Fruit>().sub({
      flies: $.collection<Fly>()
    })
  }))

  beforeAll(async () => {
    await Promise.all([
      db.fruits.set(db.fruits.id('apple'), { color: 'green' }),
      db.fruits.set(db.fruits.id('banana'), { color: 'yellow' }),
      db.fruits.set(db.fruits.id('orange'), { color: 'orange' })
    ])
  })

  afterAll(async () => {
    await Promise.all([
      db.fruits.remove(db.fruits.id('apple')),
      db.fruits.remove(db.fruits.id('banana')),
      db.fruits.remove(db.fruits.id('orange'))
    ])
  })

  it('allows to assert environment', async () => {
    const server = () =>
      db.fruits.getMany([db.fruits.id('apple'), db.fruits.id('banana')], {
        as: 'server'
      })
    const client = () =>
      db.fruits.getMany([db.fruits.id('apple'), db.fruits.id('banana')], {
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

  describe('promise', () => {
    it('returns nothing when called with empty array', async () => {
      const list = await db.fruits.getMany([])
      expect(list.length).toBe(0)
    })

    it('allows to get single doc by id', async () => {
      const fruitsFromDB = await db.fruits.getMany([db.fruits.id('apple')])
      expect(fruitsFromDB.length).toBe(1)
      expect(fruitsFromDB[0]?.type).toBe('doc')
      expect(fruitsFromDB[0]?.data.color).toBe('green')
      expect(fruitsFromDB[0]?.ref.id).toBe(db.fruits.id('apple'))
      expect(fruitsFromDB[0]?.ref.collection.path).toBe('fruits')
    })

    it('allows to get multiple docs by id', async () => {
      const fruitsFromDB = await db.fruits.getMany([
        db.fruits.id('banana'),
        db.fruits.id('apple'),
        db.fruits.id('banana'),
        db.fruits.id('orange')
      ])
      expect(fruitsFromDB.length).toBe(4)
      expect(fruitsFromDB[0]?.ref.id).toBe(db.fruits.id('banana'))
      expect(fruitsFromDB[1]?.ref.id).toBe(db.fruits.id('apple'))
      expect(fruitsFromDB[2]?.ref.id).toBe(db.fruits.id('banana'))
      expect(fruitsFromDB[3]?.ref.id).toBe(db.fruits.id('orange'))
    })

    it('throws an error when an id is missing', () =>
      db.fruits
        .getMany([db.fruits.id('nonexistant')])
        .then(() => {
          throw new Error('The promise should be rejected')
        })
        .catch((err) => {
          expect(err.message).toBe('Missing document with id nonexistant')
        }))

    it('allows to specify custom logic when a document is not found', async () => {
      const list = await db.fruits.getMany([db.fruits.id('nonexistant')], {
        onMissing: (id) => ({ color: `${id} is missing but I filled it in` })
      })
      expect(list.length).toBe(1)
      expect(list[0]?.data.color).toBe(
        'nonexistant is missing but I filled it in'
      )
    })

    it('allows to ignore missing documents', async () => {
      const list = await db.fruits.getMany(
        [
          db.fruits.id('apple'),
          db.fruits.id('nonexistant'),
          db.fruits.id('banana')
        ],
        {
          onMissing: 'ignore'
        }
      )
      expect(list.length).toBe(2)
    })

    describe('subcollection', () => {
      it('works on subcollections', async () => {
        const fruitId = await db.fruits.id()

        const [fly1, fly2] = await Promise.all([
          db.fruits(fruitId).flies.add({ color: 'Brown' }),
          db.fruits(fruitId).flies.add({ color: 'Black' })
        ])

        const updates = await db
          .fruits(fruitId)
          .flies.getMany([fly1.id, fly2.id])

        expect(updates.map((o) => o.data.color).sort()).toEqual([
          'Black',
          'Brown'
        ])
      })
    })
  })

  describe('subscription', () => {
    let off: (() => void) | undefined
    afterEach(() => {
      off && off()
      off = undefined
    })

    it('returns nothing when called with empty array', () =>
      new Promise((resolve) => {
        off = db.fruits.getMany([]).on((list) => {
          expect(list.length).toBe(0)
          resolve(void 0)
        })
      }))

    it('allows to get single doc by id', () => {
      return new Promise((resolve) => {
        off = db.fruits.getMany([db.fruits.id('apple')]).on((fruitsFromDB) => {
          expect(fruitsFromDB.length).toBe(1)
          expect(fruitsFromDB[0]?.type).toBe('doc')
          expect(fruitsFromDB[0]?.data.color).toBe('green')
          expect(fruitsFromDB[0]?.ref.id).toBe(db.fruits.id('apple'))
          expect(fruitsFromDB[0]?.ref.collection.path).toBe('fruits')
          resolve(void 0)
        })
      })
    })

    it('allows to get multiple docs by id', () =>
      new Promise((resolve) => {
        off = db.fruits
          .getMany([
            db.fruits.id('banana'),
            db.fruits.id('apple'),
            db.fruits.id('banana'),
            db.fruits.id('orange')
          ])
          .on((fruitsFromDB) => {
            expect(fruitsFromDB.length).toBe(4)
            expect(fruitsFromDB[0]?.ref.id).toBe(db.fruits.id('banana'))
            expect(fruitsFromDB[1]?.ref.id).toBe(db.fruits.id('apple'))
            expect(fruitsFromDB[2]?.ref.id).toBe(db.fruits.id('banana'))
            expect(fruitsFromDB[3]?.ref.id).toBe(db.fruits.id('orange'))
            resolve(void 0)
          })
      }))

    // TODO: Find a way to enable missing ids handling
    // it('throws an error when an id is missing', () => {
    //   return new Promise((resolve, reject) => {
    //     off = db.fruits
    //       .getMany(['nonexistant'])
    //       .on(() => {
    //         reject(new Error('onResult should not been called'))
    //       })
    //       .catch((error) => {
    //         expect(error.message).toBe('Missing document with id nonexistant')
    //         resolve(void 0)
    //       })
    //   })
    // })
    //
    // it('allows to specify custom logic when a document is not found', () =>
    //   new Promise((resolve) => {
    //     off = db.fruits
    //       .getMany(['nonexistant'], {
    //         onMissing: (id) => ({
    //           color: `${id} is missing but I filled it in`
    //         })
    //       })
    //       .on((list) => {
    //         expect(list.length).toBe(1)
    //         expect(list[0].data.color).toBe(
    //           'nonexistant is missing but I filled it in'
    //         )
    //         resolve(void 0)
    //       })
    //   }))
    //
    // it('allows to ignore missing documents', () =>
    //   new Promise((resolve) => {
    //     off = db.fruits
    //       .getMany([db.fruits.id('apple'), 'nonexistant', db.fruits.id('banana')], {
    //         onMissing: 'ignore'
    //       })
    //       .on((list) => {
    //         expect(list.length).toBe(2)
    //         resolve(void 0)
    //       })
    //   }))

    describe('subcollection', () => {
      it('works on subcollections', async () => {
        const fruitId = await db.fruits.id()

        const [fly1, fly2] = await Promise.all([
          db.fruits(fruitId).flies.add({ color: 'Brown' }),
          db.fruits(fruitId).flies.add({ color: 'Black' })
        ])

        return new Promise((resolve) => {
          off = db
            .fruits(fruitId)
            .flies.getMany([fly1.id, fly2.id])
            .on((flies) => {
              expect(flies.map((o) => o.data.color).sort()).toEqual([
                'Black',
                'Brown'
              ])
              resolve(void 0)
            })
        })
      })
    })

    describe('real-time', () => {
      it('subscribes to updates', async () => {
        await Promise.all([
          db.fruits.set(db.fruits.id('apple'), { color: 'green' }),
          db.fruits.set(db.fruits.id('mango'), { color: 'green' })
        ])
        setTimeout(() => {
          db.fruits.update(db.fruits.id('mango'), { color: 'yellow' })
        })
        return new Promise((resolve) => {
          off = db.fruits
            .getMany([db.fruits.id('apple'), db.fruits.id('mango')])
            .on((list) => {
              const colorOf = (id: Typesaurus.Id<'fruits'>) =>
                list.find((doc) => doc?.ref.id === id)!.data.color
              if (colorOf(db.fruits.id('mango')) === 'yellow') {
                db.fruits.update(db.fruits.id('mango'), { color: 'red' })
                db.fruits.update(db.fruits.id('apple'), { color: 'red' })
              }
              if (
                colorOf(db.fruits.id('mango')) === 'red' &&
                colorOf(db.fruits.id('apple')) === 'red'
              ) {
                resolve(void 0)
              }
            })
        })
      })
    })
  })
})
