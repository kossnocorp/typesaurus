export type ValueOperation =
  | 'clear'
  | 'increment'
  | 'arrayUnion'
  | 'arrayRemove'

export type ValueClear = {
  __type__: 'value'
  operation: 'clear'
}

export type ValueIncrement = {
  __type__: 'value'
  operation: 'increment'
  number: number
}

export type ValueArrayUnion = {
  __type__: 'value'
  operation: 'arrayUnion'
  values: any[]
}

export type ValueArrayRemove = {
  __type__: 'value'
  operation: 'arrayRemove'
  values: any[]
}

export type AnyValue = ValueClear
export type Value<T> = T extends number
  ? AnyValue | ValueIncrement
  : T extends Array<any>
  ? AnyValue | ValueArrayUnion | ValueArrayRemove
  : AnyValue

function value(operation: 'clear'): ValueClear

function value<T extends number>(
  operation: 'increment',
  number: number
): ValueIncrement

function value<T extends Array<any>>(
  operation: 'arrayUnion',
  payload: any[]
): ValueArrayUnion

function value<T extends Array<any>>(
  operation: 'arrayRemove',
  payload: any[]
): ValueArrayRemove

function value(
  operation: ValueOperation,
  payload?: any
): ValueClear | ValueIncrement | ValueArrayUnion | ValueArrayRemove {
  switch (operation) {
    case 'clear':
      return { __type__: 'value', operation: 'clear' }

    case 'increment':
      return { __type__: 'value', operation: 'increment', number: payload }

    case 'arrayUnion':
      return { __type__: 'value', operation: 'arrayUnion', values: payload }

    case 'arrayRemove':
      return { __type__: 'value', operation: 'arrayRemove', values: payload }
  }
}

export default value
