import { TypesaurusUtils } from '.'
import { describe, expect, it, vi } from 'vitest'

describe('TypesaurusUtils', () => {
  describe('SubscriptionPromise', () => {
    describe('promise', () => {
      it('allows to specify get function', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe: () => () => {}
        })

        const result = await promise
        expect(result).toBe('It works!')
      })

      it('calls get function just once', async () => {
        const get = vi.fn(() => Promise.resolve('It works!'))
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get,
          subscribe: () => () => {}
        })

        promise.then()
        promise.then()

        expect(await promise).toBe('It works!')
        expect(get).toBeCalledTimes(1)
      })

      it('returns then result', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe: () => () => {}
        })

        const result = await promise.then(() => 'It works, indeed!')
        expect(result).toBe('It works, indeed!')
      })

      it('allows to catch an error in then', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => {
            throw new Error('It fails!')
          },
          subscribe: () => () => {}
        })

        const onRejected = vi.fn()
        await promise.then(() => {}, onRejected)

        expect(onRejected).toBeCalledWith(new Error('It fails!'))
      })

      it("returns then's catch result", async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => {
            throw new Error('It fails!')
          },
          subscribe: () => () => {}
        })

        const result = await promise.then(
          () => {},
          () => 'It fails, indeed!'
        )

        expect(result).toBe('It fails, indeed!')
      })

      it('allows to catch an error', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => {
            throw new Error('It fails!')
          },
          subscribe: () => () => {}
        })

        const onRejected = vi.fn()
        await promise.catch(onRejected)

        expect(onRejected).toBeCalledWith(new Error('It fails!'))
      })

      it('returns catch result', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => {
            throw new Error('It fails!')
          },
          subscribe: () => () => {}
        })

        const result = await promise.catch(() => 'It fails, indeed!')

        expect(result).toBe('It fails, indeed!')
      })

      it('allows to use finally', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe: () => () => {}
        })

        const onFinally = vi.fn()
        await promise.finally(onFinally)

        expect(onFinally).toBeCalledWith()
      })

      it('bypass the result', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe: () => () => {}
        })

        const result = await promise.finally(() => 'It fails!')

        expect(result).toBe('It works!')
      })

      it('does not allow using promise after subscribing', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe: () => () => {}
        })

        promise.on(() => {})

        expect(() => promise.then(() => {})).rejects.toThrow(
          "Can't await after subscribing"
        )
      })
    })

    describe('subscription', () => {
      it('allows to subscribe', () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe: (onResult) => {
            onResult('It works!')
            return () => {}
          }
        })

        const onResult = vi.fn()
        promise.on(onResult)

        expect(onResult).toBeCalledWith('It works!')
        expect(onResult).toBeCalledTimes(1)
      })

      it('allows to subscribe multiple times', () => {
        const subscribe = vi.fn((onResult) => {
          onResult('It works, indeed!')
          return () => {}
        })

        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe
        })

        const onResult1 = vi.fn()
        promise.on(onResult1)

        const onResult2 = vi.fn()
        promise.on(onResult2)

        expect(onResult1).toBeCalledWith('It works, indeed!')
        expect(onResult1).toBeCalledTimes(1)

        expect(onResult2).toBeCalledWith('It works, indeed!')
        expect(onResult2).toBeCalledTimes(1)

        expect(subscribe).toBeCalledTimes(1)
      })

      it('allows to catch error', () => {
        const subscribe = vi.fn((_, onError) => {
          onError(new Error('It fails!'))
          return () => {}
        })

        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe
        })

        const onResult = vi.fn()
        const onError = vi.fn()
        promise.on(onResult).catch(onError)

        expect(onResult).not.toBeCalled()
        expect(onError).toBeCalledWith(new Error('It fails!'))
      })

      it('allows to catch multiple times', () => {
        const subscribe = vi.fn((_, onError) => {
          onError(new Error('It fails!'))
          return () => {}
        })

        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe
        })

        const onResult1 = vi.fn()
        const onError1 = vi.fn()
        promise.on(onResult1).catch(onError1)

        const onResult2 = vi.fn()
        const onError2 = vi.fn()
        promise.on(onResult2).catch(onError2)

        expect(onError1).toBeCalledWith(new Error('It fails!'))
        expect(onError1).toBeCalledTimes(1)

        expect(onError2).toBeCalledWith(new Error('It fails!'))
        expect(onError2).toBeCalledTimes(1)

        expect(subscribe).toBeCalledTimes(1)
      })

      it('unsubscribes when calling off function', () =>
        new Promise((resolve) => {
          const subscribe = vi.fn((onResult) => {
            onResult('It works, indeed!')
            return () => resolve(void 0)
          })

          const promise = new TypesaurusUtils.SubscriptionPromise({
            get: () => Promise.resolve('It works!'),
            subscribe
          })

          promise.on(() => {}).catch(() => {})()
        }))

      it('unsubscribes when calling off function after catch', () =>
        new Promise((resolve) => {
          const subscribe = vi.fn((onResult) => {
            onResult('It works, indeed!')
            return () => resolve(void 0)
          })

          const promise = new TypesaurusUtils.SubscriptionPromise({
            get: () => Promise.resolve('It works!'),
            subscribe
          })

          promise.on(() => {}).catch(() => {})()
        }))

      it('unsubscribes given listener when calling its off function', () =>
        new Promise((resolve, reject) => {
          const onResult1 = vi.fn()
          const onResult2 = vi.fn()

          const subscribe = vi.fn((onResult) => {
            onResult('It works, indeed!')

            setTimeout(() => {
              onResult('It works like charm!')

              expect(onResult1).toBeCalledWith('It works, indeed!')
              expect(onResult1).not.toBeCalledWith('It works like charm!')

              expect(onResult2).toBeCalledWith('It works, indeed!')
              expect(onResult2).toBeCalledWith('It works like charm!')

              resolve(void 0)
            }, 1)

            return () => reject(void 0)
          })

          const promise = new TypesaurusUtils.SubscriptionPromise({
            get: () => Promise.resolve('It works!'),
            subscribe
          })

          const off = promise.on(onResult1)
          promise.on(onResult2)

          off()
        }))

      it('unsubscribes when calling all of the listener off functions', () =>
        new Promise((resolve, reject) => {
          const onResult1 = vi.fn()
          const onResult2 = vi.fn()

          const subscribe = vi.fn((onResult) => {
            onResult('It works, indeed!')

            setTimeout(() => {
              onResult('It works like charm!')

              expect(onResult1).toBeCalledWith('It works, indeed!')
              expect(onResult1).not.toBeCalledWith('It works like charm!')

              expect(onResult2).toBeCalledWith('It works, indeed!')
              expect(onResult2).not.toBeCalledWith('It works like charm!')
            }, 1)

            return () => resolve(void 0)
          })

          const promise = new TypesaurusUtils.SubscriptionPromise({
            get: () => Promise.resolve('It works!'),
            subscribe
          })

          const off1 = promise.on(onResult1)
          const off2 = promise.on(onResult2)

          off1()
          off2()
        }))

      it('does not allow subscribing after using promise', async () => {
        const promise = new TypesaurusUtils.SubscriptionPromise({
          get: () => Promise.resolve('It works!'),
          subscribe: () => () => {}
        })

        await promise

        expect(() => promise.on(() => {})).toThrow(
          "Can't subscribe after awaiting"
        )
      })
    })
  })
})
