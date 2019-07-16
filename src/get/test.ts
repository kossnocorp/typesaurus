import assert from 'assert'
import get from '.'
import { collection } from '../collection'

describe('get', () => {
  it('returns nothing if document is not present', async () => {
    const nothing = await get(collection('nope'), 'nah')
    assert(nothing === undefined)
  })
})
