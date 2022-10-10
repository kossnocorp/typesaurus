import { data } from './index'

describe('data', () => {
  describe('data', () => {
    it('replaces undefineds with nulls', () => {
      const result = data({
        a: undefined,
        b: { c: { d: undefined, e: 123 } },
        f: '456',
        d: [[undefined], 789]
      })
      expect(result).toEqual({
        a: null,
        b: { c: { d: null, e: 123 } },
        f: '456',
        d: [[null], 789]
      })
    })
  })
})
