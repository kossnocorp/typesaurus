import { id } from '../adaptor'

describe('id', () => {
  it('generates random id', async () => {
    const userId = await id()
    expect(typeof userId).toBe('string')
    expect(userId.length > 10).toBe(true)
  })
})
