export type ValueIncrement = {
  __type__: 'value'
  operation: 'increment'
  number: number
}

export type ValueClear = {
  __type__: 'value'
  operation: 'clear'
}

export type AnyValue = ValueClear
export type Value<T> = T extends number ? AnyValue | ValueIncrement : AnyValue

export function increment(number: number): ValueIncrement {
  return { __type__: 'value', operation: 'increment', number }
}

export function clear(): ValueClear {
  return { __type__: 'value', operation: 'clear' }
}
