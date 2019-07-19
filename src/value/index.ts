export type ValueKind = 'clear' | 'increment' | 'arrayUnion' | 'arrayRemove'

export type ValueClear = {
  __type__: 'value'
  kind: 'clear'
}

export type ValueIncrement = {
  __type__: 'value'
  kind: 'increment'
  number: number
}

export type ValueArrayUnion = {
  __type__: 'value'
  kind: 'arrayUnion'
  values: any[]
}

export type ValueArrayRemove = {
  __type__: 'value'
  kind: 'arrayRemove'
  values: any[]
}

export type AnyUpdateValue = ValueClear

export type UpdateValue<T> = T extends number
  ? AnyUpdateValue | ValueIncrement
  : T extends Array<any>
  ? AnyUpdateValue | ValueArrayUnion | ValueArrayRemove
  : AnyUpdateValue

function value(kind: 'clear'): ValueClear

function value<T extends number>(
  kind: 'increment',
  number: number
): ValueIncrement

function value<T extends Array<any>>(
  kind: 'arrayUnion',
  payload: any[]
): ValueArrayUnion

function value<T extends Array<any>>(
  kind: 'arrayRemove',
  payload: any[]
): ValueArrayRemove

function value(
  kind: ValueKind,
  payload?: any
): ValueClear | ValueIncrement | ValueArrayUnion | ValueArrayRemove {
  switch (kind) {
    case 'clear':
      return { __type__: 'value', kind: 'clear' }

    case 'increment':
      return { __type__: 'value', kind: 'increment', number: payload }

    case 'arrayUnion':
      return { __type__: 'value', kind: 'arrayUnion', values: payload }

    case 'arrayRemove':
      return { __type__: 'value', kind: 'arrayRemove', values: payload }
  }
}

export default value
