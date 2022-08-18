import { Id, Ref, schema } from '..'

describe('many', () => {
  interface Fruit {
    color: string
    tree?: Ref<Tree, 'trees'>
    lastFly?: Ref<Fly, 'fruits/flies'>
  }

  interface Fly {
    color: string
  }

  interface Tree {
    name: string
  }

  const db = schema(($) => ({
    fruits: $.collection<Fruit>().sub({
      flies: $.collection<Fly>()
    }),
    trees: $.collection<Tree>()
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
      db.fruits.many([db.fruits.id('apple'), db.fruits.id('banana')], {
        as: 'server'
      })
    const client = () =>
      db.fruits.many([db.fruits.id('apple'), db.fruits.id('banana')], {
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
      const fruits = await db.fruits.many([])
      expect(fruits.length).toBe(0)
    })

    it('allows to get single doc by id', async () => {
      const fruits = await db.fruits.many([db.fruits.id('apple')])
      expect(fruits.length).toBe(1)
      expect(fruits[0]?.type).toBe('doc')
      expect(fruits[0]?.data.color).toBe('green')
      expect(fruits[0]?.ref.id).toBe(db.fruits.id('apple'))
      expect(fruits[0]?.ref.collection.path).toBe('fruits')
    })

    it('allows to get multiple docs by id', async () => {
      const fruits = await db.fruits.many([
        db.fruits.id('banana'),
        db.fruits.id('apple'),
        db.fruits.id('banana'),
        db.fruits.id('orange')
      ])
      expect(fruits.length).toBe(4)
      expect(fruits[0]?.ref.id).toBe('banana')
      expect(fruits[1]?.ref.id).toBe('apple')
      expect(fruits[2]?.ref.id).toBe('banana')
      expect(fruits[3]?.ref.id).toBe('orange')
    })

    it('returns null when a document is not found', async () => {
      const list = await db.fruits.many([
        db.fruits.id('apple'),
        db.fruits.id('nonexistant'),
        db.fruits.id('banana')
      ])
      expect(list.length).toBe(3)
      expect(list[0]?.ref.id).toBe('apple')
      expect(list[1]).toBeNull()
      expect(list[2]?.ref.id).toBe('banana')
    })

    it('expands references', async () => {
      const treeRef = await db.trees.set(db.trees.id('palm'), {
        name: 'Pineapple palm'
      })
      await db.fruits.set(db.fruits.id('pineapple'), {
        color: 'yellow',
        tree: treeRef
      })

      const fruits = await db.fruits.many([db.fruits.id('pineapple')])

      expect(fruits[0]?.data.tree?.type).toBe('ref')
      expect(fruits[0]?.data.tree?.id).toBe('palm')
      expect(fruits[0]?.data.tree?.collection.type).toBe('collection')
      expect(fruits[0]?.data.tree?.collection.path).toBe('trees')
    })

    describe('subcollection', () => {
      it('works on subcollections', async () => {
        const fruitId = await db.fruits.id()

        const [fly1, fly2] = await Promise.all([
          db.fruits(fruitId).flies.add({ color: 'Brown' }),
          db.fruits(fruitId).flies.add({ color: 'Black' })
        ])

        const flies = await db.fruits(fruitId).flies.many([fly1.id, fly2.id])

        expect(flies.map((fly) => fly?.data.color).sort()).toEqual([
          'Black',
          'Brown'
        ])
      })

      it('expands references', async () => {
        const fruitId = await db.fruits.id()

        const flyRef = await db.fruits(fruitId).flies.add({
          color: 'Red'
        })

        await db.fruits.set(fruitId, {
          color: 'Pink',
          lastFly: flyRef
        })

        const fruits = await db.fruits.many([fruitId])

        expect(fruits[0]?.data.lastFly?.type).toBe('ref')
        expect(fruits[0]?.data.lastFly?.id).toBe(flyRef.id)
        expect(fruits[0]?.data.lastFly?.collection.type).toBe('collection')
        expect(fruits[0]?.data.lastFly?.collection.path).toBe(
          `fruits/${fruitId}/flies`
        )
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
        off = db.fruits.many([]).on((fruits) => {
          expect(fruits.length).toBe(0)
          resolve(void 0)
        })
      }))

    it('allows to get single doc by id', () => {
      return new Promise((resolve) => {
        off = db.fruits.many([db.fruits.id('apple')]).on((fruits) => {
          expect(fruits.length).toBe(1)
          expect(fruits[0]?.type).toBe('doc')
          expect(fruits[0]?.data.color).toBe('green')
          expect(fruits[0]?.ref.id).toBe(db.fruits.id('apple'))
          expect(fruits[0]?.ref.collection.path).toBe('fruits')
          resolve(void 0)
        })
      })
    })

    it('allows to get multiple docs by id', () =>
      new Promise((resolve) => {
        off = db.fruits
          .many([
            db.fruits.id('banana'),
            db.fruits.id('apple'),
            db.fruits.id('banana'),
            db.fruits.id('orange')
          ])
          .on((fruits) => {
            expect(fruits.length).toBe(4)
            expect(fruits[0]?.ref.id).toBe(db.fruits.id('banana'))
            expect(fruits[1]?.ref.id).toBe(db.fruits.id('apple'))
            expect(fruits[2]?.ref.id).toBe(db.fruits.id('banana'))
            expect(fruits[3]?.ref.id).toBe(db.fruits.id('orange'))
            resolve(void 0)
          })
      }))

    it('returns null when document is not found', () =>
      new Promise((resolve) => {
        off = db.fruits
          .many([
            db.fruits.id('apple'),
            db.fruits.id('nonexistant'),
            db.fruits.id('banana')
          ])
          .on((fruits) => {
            expect(fruits.length).toBe(3)
            expect(fruits[0]?.ref.id).toBe('apple')
            expect(fruits[1]).toBeNull()
            expect(fruits[2]?.ref.id).toBe('banana')
            resolve(void 0)
          })
      }))

    it('expands references', async () => {
      const treeRef = await db.trees.set(db.trees.id('palm'), {
        name: 'Pineapple palm'
      })
      await db.fruits.set(db.fruits.id('pineapple'), {
        color: 'yellow',
        tree: treeRef
      })

      return new Promise((resolve) => {
        off = db.fruits.many([db.fruits.id('pineapple')]).on((fruits) => {
          expect(fruits[0]?.data.tree?.type).toBe('ref')
          expect(fruits[0]?.data.tree?.id).toBe('palm')
          expect(fruits[0]?.data.tree?.collection.type).toBe('collection')
          expect(fruits[0]?.data.tree?.collection.path).toBe('trees')
          resolve(void 0)
        })
      })
    })

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
            .flies.many([fly1.id, fly2.id])
            .on((flies) => {
              expect(flies.map((fly) => fly?.data.color).sort()).toEqual([
                'Black',
                'Brown'
              ])
              resolve(void 0)
            })
        })
      })

      it('expands references', async () => {
        const fruitId = await db.fruits.id()

        const flyRef = await db.fruits(fruitId).flies.add({
          color: 'Red'
        })

        await db.fruits.set(fruitId, {
          color: 'Pink',
          lastFly: flyRef
        })

        return new Promise((resolve) => {
          off = db.fruits.many([fruitId]).on((fruits) => {
            expect(fruits[0]?.data.lastFly?.type).toBe('ref')
            expect(fruits[0]?.data.lastFly?.id).toBe(flyRef.id)
            expect(fruits[0]?.data.lastFly?.collection.type).toBe('collection')
            expect(fruits[0]?.data.lastFly?.collection.path).toBe(
              `fruits/${fruitId}/flies`
            )
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
            .many([db.fruits.id('apple'), db.fruits.id('mango')])
            .on((fruits) => {
              const colorOf = (id: Id<'fruits'>) =>
                fruits.find((doc) => doc?.ref.id === id)!.data.color
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
