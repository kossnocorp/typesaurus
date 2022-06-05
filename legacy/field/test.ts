import { field, Field } from '.'
import { value } from '../value'

describe('field', () => {
  it('allows pointing to deeply nested fields', () => {
    type TestModel = { a: { b: { c: number } } }
    assertField<TestModel>(field('a', { b: { c: 1 } }))
    assertField<TestModel>(field(['a'], { b: { c: 1 } }))
    // @ts-expect-error
    assertField<TestModel>(field('a', { b: 'nope' }))
    assertField<TestModel>(field(['a', 'b'], { c: 1 }))
    // @ts-expect-error
    assertField<TestModel>(field(['a', 'b'], 'nope'))
    assertField<TestModel>(field(['a', 'b', 'c'], 4))
    // @ts-expect-error
    assertField<TestModel>(field(['a', 'b', 'c'], 'nope'))
  })

  it('disallows deleting required fields', () => {
    type TestModel = {
      a: { b: { c: number; d?: string } }
      e?: string
      f?: { [key: string]: number | undefined }
    }
    // @ts-expect-error
    assertField<TestModel>(field(['a', 'b', 'c'], value('remove')))
    assertField<TestModel>(field(['a', 'b', 'c'], value('increment', 1)))
    assertField<TestModel>(field(['a', 'b', 'd'], value('remove')))
    assertField<TestModel>(field('e', 'ok'))
    assertField<TestModel>(field('e', value('remove')))
    assertField<TestModel>(field(['f', 'ok'], value('remove')))
  })

  it('allows updating fields in optional partial objects', () => {
    type TestModel = {
      a?: { b?: number; c?: string }
      d?: { e: number; f: string }
      g?: { [key: string]: number | undefined }
      h?: { [key: string]: number }
      i: { j: number; k: string }
      l?: { [key: string]: string | undefined }
    }
    assertField<TestModel>(field(['a', 'b'], 123))
    assertField<TestModel>(field(['a', 'b'], value('remove')))
    // @ts-expect-error
    assertField<TestModel>(field(['d', 'e'], 123))
    // @ts-expect-error
    assertField<TestModel>(field(['d', 'e'], value('remove')))
    assertField<TestModel>(field(['g', 'qwe'], 123))
    assertField<TestModel>(field(['i', 'j'], 123))
    assertField<TestModel>(field(['g', 'ok'], value('increment', 1)))
    assertField<TestModel>(field(['h', 'ok'], value('increment', 1)))
    // @ts-expect-error
    assertField<TestModel>(field(['h', 'nope'], 123))
    // @ts-expect-error
    assertField<TestModel>(field(['k', 'nope'], value('increment', 1)))
  })
})

function assertField<Model>(_field: Field<Model>) {}
