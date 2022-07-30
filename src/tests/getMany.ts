import { schema } from '../adaptor'

describe('getMany', () => {
  interface Fruit {
    color: string
  }

  const db = schema(($) => ({
    fruits: $.collection<Fruit>()
  }))

  beforeAll(async () => {
    await Promise.all([
      db.fruits.set('apple', { color: 'green' }),
      db.fruits.set('banana', { color: 'yellow' }),
      db.fruits.set('orange', { color: 'orange' })
    ])
  })

  afterAll(async () => {
    await Promise.all([
      db.fruits.remove('apple'),
      db.fruits.remove('banana'),
      db.fruits.remove('orange')
    ])
  })

  describe('promise', () => {
    it('returns nothing when called with empty array', async () => {
      const list = await db.fruits.getMany([])
      expect(list.length).toBe(0)
    })

    it('allows to get single doc by id', async () => {
      const fruitsFromDB = await db.fruits.getMany(['apple'])
      expect(fruitsFromDB.length).toBe(1)
      expect(fruitsFromDB[0]?.type).toBe('doc')
      expect(fruitsFromDB[0]?.data.color).toBe('green')
      expect(fruitsFromDB[0]?.ref.id).toBe('apple')
      expect(fruitsFromDB[0]?.ref.collection.path).toBe('fruits')
    })

    it('allows to get multiple docs by id', async () => {
      const fruitsFromDB = await db.fruits.getMany([
        'banana',
        'apple',
        'banana',
        'orange'
      ])
      expect(fruitsFromDB.length).toBe(4)
      expect(fruitsFromDB[0]?.ref.id).toBe('banana')
      expect(fruitsFromDB[1]?.ref.id).toBe('apple')
      expect(fruitsFromDB[2]?.ref.id).toBe('banana')
      expect(fruitsFromDB[3]?.ref.id).toBe('orange')
    })

    it('throws an error when an id is missing', () =>
      db.fruits
        .getMany(['nonexistant'])
        .then(() => {
          throw new Error('The promise should be rejected')
        })
        .catch((err) => {
          expect(err.message).toBe('Missing document with id nonexistant')
        }))

    it('allows to specify custom logic when a document is not found', async () => {
      const list = await db.fruits.getMany(['nonexistant'], {
        onMissing: (id) => ({ color: `${id} is missing but I filled it in` })
      })
      expect(list.length).toBe(1)
      expect(list[0]?.data.color).toBe(
        'nonexistant is missing but I filled it in'
      )
    })

    it('allows to ignore missing documents', async () => {
      const list = await db.fruits.getMany(['apple', 'nonexistant', 'banana'], {
        onMissing: 'ignore'
      })
      expect(list.length).toBe(2)
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
        off = db.fruits.getMany(['apple']).on((fruitsFromDB) => {
          expect(fruitsFromDB.length).toBe(1)
          expect(fruitsFromDB[0]?.type).toBe('doc')
          expect(fruitsFromDB[0]?.data.color).toBe('green')
          expect(fruitsFromDB[0]?.ref.id).toBe('apple')
          expect(fruitsFromDB[0]?.ref.collection.path).toBe('fruits')
          resolve(void 0)
        })
      })
    })

    it('allows to get multiple docs by id', () =>
      new Promise((resolve) => {
        off = db.fruits
          .getMany(['banana', 'apple', 'banana', 'orange'])
          .on((fruitsFromDB) => {
            expect(fruitsFromDB.length).toBe(4)
            expect(fruitsFromDB[0]?.ref.id).toBe('banana')
            expect(fruitsFromDB[1]?.ref.id).toBe('apple')
            expect(fruitsFromDB[2]?.ref.id).toBe('banana')
            expect(fruitsFromDB[3]?.ref.id).toBe('orange')
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
    //       .getMany(['apple', 'nonexistant', 'banana'], {
    //         onMissing: 'ignore'
    //       })
    //       .on((list) => {
    //         expect(list.length).toBe(2)
    //         resolve(void 0)
    //       })
    //   }))

    describe('real-time', () => {
      it('subscribes to updates', async () => {
        await Promise.all([
          db.fruits.set('apple', { color: 'green' }),
          db.fruits.set('mango', { color: 'green' })
        ])
        setTimeout(() => {
          db.fruits.update('mango', { color: 'yellow' })
        })
        return new Promise((resolve) => {
          off = db.fruits.getMany(['apple', 'mango']).on((list) => {
            const colorOf = (id: string) =>
              list.find((doc) => doc?.ref.id === id)!.data.color
            if (colorOf('mango') === 'yellow') {
              db.fruits.update('mango', { color: 'red' })
              db.fruits.update('apple', { color: 'red' })
            }
            if (colorOf('mango') === 'red' && colorOf('apple') === 'red') {
              resolve(void 0)
            }
          })
        })
      })
    })
  })
})
