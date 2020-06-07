import field, { Field } from '.'
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
    type TestModel = { a: { b: { c: number; d?: string } }; e?: string }
    // @ts-expect-error
    assertField<TestModel>(field(['a', 'b', 'c'], value('remove')))
    assertField<TestModel>(field(['a', 'b', 'c'], value('increment', 1)))
    assertField<TestModel>(field(['a', 'b', 'd'], value('remove')))
    assertField<TestModel>(field('e', 'ok'))
    assertField<TestModel>(field('e', value('remove')))
  })
})

function assertField<Model>(fields: Field<Model>) {}
