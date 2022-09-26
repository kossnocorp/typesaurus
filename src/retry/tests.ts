import { SubscriptionPromise } from '../sp/index'
import { retry } from './index'

describe('retry', () => {
  it('allows to retry subscriptions', () =>
    new Promise(async (resolve, reject) => {
      const now = Date.now()
      let counter = 0

      const sp = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('ok'),
        subscribe: (onResult, onError) => {
          if (counter >= 2) {
            expect(Date.now() - now).toBeGreaterThanOrEqual(750)
            onResult('ok')
          } else {
            counter++
            onError(new Error('nope'))
          }

          return () => {}
        }
      })

      // @ts-ignore - make SubscriptionPromise plain JS
      retry(sp.on)(resolve).catch(reject)
    }))

  it('allows to specify retry pattern', () =>
    new Promise(async (resolve, reject) => {
      const now = Date.now()
      let counter = 0

      const sp = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('ok'),
        subscribe: (onResult, onError) => {
          if (counter >= 2) {
            expect(Date.now() - now).toBeLessThan(20)
            onResult('ok')
          } else {
            counter++
            onError(new Error('nope'))
          }

          return () => {}
        }
      })

      // @ts-ignore - make SubscriptionPromise plain JS
      retry(sp.on, { pattern: [0, 0, 0] })(resolve).catch(reject)
    }))

  it('calls error callback after done trying', () =>
    new Promise(async (resolve, reject) => {
      const error = new Error('nope')
      const now = Date.now()
      let counter = 0

      const sp = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('ok'),
        subscribe: (onResult, onError) => {
          if (counter >= 2) {
            expect(Date.now() - now).toBeLessThan(20)
            onResult('ok')
          } else {
            counter++
            onError(error)
          }

          return () => {}
        }
      })

      // @ts-ignore - make SubscriptionPromise plain JS
      retry(sp.on, { pattern: [0] })(reject).catch((error) => {
        expect(error).toBe(error)
        resolve(void 0)
      })
    }))

  it('allows to retry multiple times', () =>
    new Promise(async (resolve, reject) => {
      const now = Date.now()
      let counter = 0

      const sp = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('ok'),
        subscribe: (onResult, onError) => {
          if (counter == 2) {
            expect(Date.now() - now).toBeGreaterThanOrEqual(750)
            onResult('ok')
          } else if (counter == 4) {
            expect(Date.now() - now).toBeGreaterThanOrEqual(1500)
            onResult('ok')
          } else {
            counter++
            onError(new Error('nope'))
          }

          return () => {}
        }
      })

      // @ts-ignore - make SubscriptionPromise plain JS
      const off = retry(sp.on)(() => {
        off()
        // @ts-ignore - make SubscriptionPromise plain JS
        retry(sp.on)(resolve).catch(reject)
      }).catch(reject)
    }))

  it('allows to bypass retry', () =>
    new Promise(async (resolve, reject) => {
      const now = Date.now()
      let counter = 0

      const sp = new SubscriptionPromise({
        request: null,
        get: () => Promise.resolve('ok'),
        subscribe: (onResult, onError) => {
          if (counter >= 2) {
            onResult('ok')
          } else {
            counter++
            onError(new Error('nope'))
          }

          return () => {}
        }
      })

      // @ts-ignore - make SubscriptionPromise plain JS
      retry(sp.on, { bypass: true })(reject).catch(resolve)
    }))
})
