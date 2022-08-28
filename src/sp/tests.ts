import sinon from 'sinon'
import { SubscriptionPromise } from '.'

describe('SubscriptionPromise', () => {
  describe('promise', () => {
    it('allows to specify get function', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: () => () => {}
      })

      const result = await promise
      expect(result).toBe('It works!')
    })

    it('calls get function just once', async () => {
      const get = sinon.spy(() => Promise.resolve('It works!'))
      const promise = new SubscriptionPromise({
        request: null,
        get,
        subscribe: () => () => {}
      })

      promise.then()
      promise.then()

      expect(await promise).toBe('It works!')
      expect(get.calledOnce).toBe(true)
    })

    it('returns then result', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: () => () => {}
      })

      const result = await promise.then(() => 'It works, indeed!')
      expect(result).toBe('It works, indeed!')
    })

    it('allows to catch an error in then', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => {
          throw new Error('It fails!')
        },
        subscribe: () => () => {}
      })

      const onRejected = sinon.spy()
      await promise.then(() => {}, onRejected)

      expect(calledWithError(onRejected, 'It fails!')).toBe(true)
    })

    it("returns then's catch result", async () => {
      const promise = new SubscriptionPromise({
        request: null,
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
      const promise = new SubscriptionPromise({
        request: null,
        get: () => {
          throw new Error('It fails!')
        },
        subscribe: () => () => {}
      })

      const onRejected = sinon.spy()
      await promise.catch(onRejected)

      expect(calledWithError(onRejected, 'It fails!')).toBe(true)
    })

    it('returns catch result', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => {
          throw new Error('It fails!')
        },
        subscribe: () => () => {}
      })

      const result = await promise.catch(() => 'It fails, indeed!')

      expect(result).toBe('It fails, indeed!')
    })

    it('allows to use finally', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: () => () => {}
      })

      const onFinally = sinon.spy()
      await promise.finally(onFinally)

      expect(onFinally.calledWith()).toBe(true)
    })

    it('bypass the result', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: () => () => {}
      })

      const result = await promise.finally(() => 'It fails!')

      expect(result).toBe('It works!')
    })

    it('does not allow using promise after subscribing', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: () => () => {}
      })

      promise.on(() => {})

      return new Promise((resolve, reject) =>
        promise.then(reject, (error) => {
          expect(error.message).toBe("Can't await after subscribing")
          resolve(void 0)
        })
      )
    })
  })

  describe('subscription', () => {
    it('allows to subscribe', () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: (onResult) => {
          onResult('It works!')
          return () => {}
        }
      })

      const onResult = sinon.spy()
      promise.on(onResult)

      expect(onResult.calledWith('It works!')).toBe(true)
      expect(onResult.calledOnce).toBe(true)
    })

    it('allows to get pass meta information', () => {
      const promise = new SubscriptionPromise<null, string, { meta: string }>({
        request: null,

        get: () => Promise.resolve('It works!'),

        subscribe: (onResult, onError) => {
          onResult('It works!', { meta: 'data' })
          return () => {}
        }
      })

      const onResult = sinon.spy()
      promise.on(onResult)

      expect(onResult.calledWith('It works!', { meta: 'data' })).toBe(true)
    })

    it('allows to subscribe multiple times', () => {
      const subscribe = sinon.spy((onResult) => {
        onResult('It works, indeed!')
        return () => {}
      })

      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe
      })

      const onResult1 = sinon.spy()
      promise.on(onResult1)

      const onResult2 = sinon.spy()
      promise.on(onResult2)

      expect(onResult1.calledWith('It works, indeed!')).toBe(true)
      expect(onResult1.calledOnce).toBe(true)

      expect(onResult2.calledWith('It works, indeed!')).toBe(true)
      expect(onResult2.calledOnce).toBe(true)

      expect(subscribe.calledOnce).toBe(true)
    })

    it('allows to catch error', () => {
      const subscribe = sinon.spy((_, onError) => {
        onError(new Error('It fails!'))
        return () => {}
      })

      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe
      })

      const onResult = sinon.spy()
      const onError = sinon.spy()
      promise.on(onResult).catch(onError)

      expect(onResult.called).toBe(false)
      expect(calledWithError(onError, 'It fails!')).toBe(true)
    })

    it('allows to catch multiple times', () => {
      const subscribe = sinon.spy((_, onError) => {
        onError(new Error('It fails!'))
        return () => {}
      })

      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe
      })

      const onResult1 = sinon.spy()
      const onError1 = sinon.spy()
      promise.on(onResult1).catch(onError1)

      const onResult2 = sinon.spy()
      const onError2 = sinon.spy()
      promise.on(onResult2).catch(onError2)

      expect(calledWithError(onError1, 'It fails!')).toBe(true)
      expect(onError1.calledOnce).toBe(true)

      expect(calledWithError(onError2, 'It fails!')).toBe(true)
      expect(onError2.calledOnce).toBe(true)

      expect(subscribe.calledOnce).toBe(true)
    })

    it('unsubscribes when calling off function', () =>
      new Promise((resolve) => {
        const subscribe = sinon.spy((onResult) => {
          onResult('It works, indeed!')
          return () => resolve(void 0)
        })

        const promise = new SubscriptionPromise({
          request: null,
          get: () => Promise.resolve('It works!'),
          subscribe
        })

        promise.on(() => {}).catch(() => {})()
      }))

    it('unsubscribes when calling off function after catch', () =>
      new Promise((resolve) => {
        const subscribe = sinon.spy((onResult) => {
          onResult('It works, indeed!')
          return () => resolve(void 0)
        })

        const promise = new SubscriptionPromise({
          request: null,
          get: () => Promise.resolve('It works!'),
          subscribe
        })

        promise.on(() => {}).catch(() => {})()
      }))

    it('unsubscribes given listener when calling its off function', () =>
      new Promise((resolve, reject) => {
        const onResult1 = sinon.spy()
        const onResult2 = sinon.spy()

        const subscribe = sinon.spy((onResult) => {
          onResult('It works, indeed!')

          setTimeout(() => {
            onResult('It works like charm!')

            expect(onResult1.calledWith('It works, indeed!')).toBe(true)
            expect(onResult1.calledWith('It works like charm!')).not.toBe(true)

            expect(onResult2.calledWith('It works, indeed!')).toBe(true)
            expect(onResult2.calledWith('It works like charm!')).toBe(true)

            resolve(void 0)
          }, 1)

          return () => reject(void 0)
        })

        const promise = new SubscriptionPromise({
          request: null,
          get: () => Promise.resolve('It works!'),
          subscribe
        })

        const off = promise.on(onResult1)
        promise.on(onResult2)

        off()
      }))

    it('unsubscribes when calling all of the listener off functions', () =>
      new Promise((resolve, reject) => {
        const onResult1 = sinon.spy()
        const onResult2 = sinon.spy()

        const subscribe = sinon.spy((onResult) => {
          onResult('It works, indeed!')

          setTimeout(() => {
            onResult('It works like charm!')

            expect(onResult1.calledWith('It works, indeed!')).toBe(true)
            expect(onResult1.calledWith('It works like charm!')).toBe(false)

            expect(onResult2.calledWith('It works, indeed!')).toBe(true)
            expect(onResult2.calledWith('It works like charm!')).toBe(false)
          }, 1)

          return () => resolve(void 0)
        })

        const promise = new SubscriptionPromise({
          request: null,
          get: () => Promise.resolve('It works!'),
          subscribe
        })

        const off1 = promise.on(onResult1)
        const off2 = promise.on(onResult2)

        off1()
        off2()
      }))

    it('does not allow subscribing after using promise', async () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: () => () => {}
      })

      await promise

      expect(() => promise.on(() => {})).toThrowError(
        "Can't subscribe after awaiting"
      )
    })

    it('binds on function', () => {
      const promise = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('It works!'),
        subscribe: (onResult) => {
          onResult('It works!')
          return () => {}
        }
      })

      const onResult = sinon.spy()
      const on = promise.on
      on(onResult)

      expect(onResult.calledWith('It works!')).toBe(true)
      expect(onResult.calledOnce).toBe(true)
    })

    it('exposes request at on function', () => {
      const promise = new SubscriptionPromise({
        request: 'Hello, world!',
        get: () => Promise.resolve('It works!'),
        subscribe: (onResult) => {
          onResult('It works!')
          return () => {}
        }
      })

      // @ts-ignore: I don't know why TS trips, SubscriptionPromiseOn is ok
      expect(promise.on.request).toBe('Hello, world!')
    })
  })
})

function calledWithError(spy: sinon.SinonSpy, message: string) {
  return spy.calledWith(
    sinon.match.instanceOf(Error).and(sinon.match.has('message', message))
  )
}
