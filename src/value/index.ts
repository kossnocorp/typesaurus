export type ValueOperation = 'clear' | 'increment'

export type ValueClear = {
  __type__: 'value'
  operation: 'clear'
}
export type ValueIncrement = {
  __type__: 'value'
  operation: 'increment'
  number: number
}

export type AnyValue = ValueClear
export type Value<T> = T extends number ? AnyValue | ValueIncrement : AnyValue

function value(operation: 'clear'): ValueClear

function value<T extends number>(
  operation: 'increment',
  number: number
): ValueIncrement

function value(
  operation: ValueOperation,
  payload?: any
): ValueClear | ValueIncrement {
  switch (operation) {
    case 'clear':
      return { __type__: 'value', operation: 'clear' }

    case 'increment':
      return { __type__: 'value', operation: 'increment', number: payload }
  }
}

export default value
