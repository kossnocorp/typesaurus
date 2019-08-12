/**
 * Available value kinds.
 */
export type ValueKind =
  | 'clear'
  | 'increment'
  | 'arrayUnion'
  | 'arrayRemove'
  | 'serverDate'

/**
 * The clear value type.
 */
export type ValueClear = {
  __type__: 'value'
  kind: 'clear'
}

/**
 * The increment value type. It holds the increment value.
 */
export type ValueIncrement = {
  __type__: 'value'
  kind: 'increment'
  number: number
}

/**
 * The array union value type. It holds the payload to union.
 */
export type ValueArrayUnion = {
  __type__: 'value'
  kind: 'arrayUnion'
  values: any[]
}

/**
 * The array remove value type. It holds the data to remove from the target array.
 */
export type ValueArrayRemove = {
  __type__: 'value'
  kind: 'arrayRemove'
  values: any[]
}

/**
 * The server date value type.
 */
export interface ValueServerDate extends Date {
  __type__: 'value'
  kind: 'serverDate'
}

/**
 * The value types that have no type constraints.
 */
export type AnyUpdateValue = ValueClear

/**
 * The value types to use for update operation.
 */
export type UpdateValue<T> = T extends number
  ? AnyUpdateValue | ValueIncrement
  : T extends Array<any>
  ? AnyUpdateValue | ValueArrayUnion | ValueArrayRemove
  : T extends Date
  ? ValueServerDate | AnyUpdateValue
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

function value<T extends Date>(kind: 'serverDate'): ValueServerDate

/**
 * Creates a value object.
 *
 * @param kind - The value kind ('clear', 'increment', 'arrayUnion', 'arrayRemove' or 'serverDate')
 * @param payload - The payload if required by the kind
 *
 * @example
 * import { value, set, update, collection } from 'typesaurus'
 *
 * type User = {
 *   name: string,
 *   friends: number
 *   interests: string[]
 *   registrationDate: Date
 *   note?: string
 * }
 *
 * const users = collection<User>('users')
 *
 * (async () => {
 *   await set(users, '00sHm46UWKObv2W7XK9e', {
 *     name: 'Sasha',
 *     friends: 123,
 *     interests: ['snowboarding', 'surfboarding', 'running'],
 *     // Set server date value to the field
 *     registrationDate: value('serverDate')
 *   })
 *
 *   await update(users, '00sHm46UWKObv2W7XK9e', {
 *     // Add 2 to the value
 *     friends: value('increment', 2),
 *     // Remove 'running' from the interests
 *     interests: value('arrayRemove', ['running']),
 *     note: 'Demo'
 *   })
 *
 *   await update(users, '00sHm46UWKObv2W7XK9e', {
 *     // Remove the field
 *     note: value('clear')
 *     // Add values to the interests
 *     interests: value('arrayUnion', ['skateboarding', 'minecraft'])
 *   })
 * })()
 */
function value(
  kind: ValueKind,
  payload?: any
):
  | ValueClear
  | ValueIncrement
  | ValueArrayUnion
  | ValueArrayRemove
  | ValueServerDate {
  switch (kind) {
    case 'clear':
      return { __type__: 'value', kind: 'clear' }

    case 'increment':
      return { __type__: 'value', kind: 'increment', number: payload }

    case 'arrayUnion':
      return { __type__: 'value', kind: 'arrayUnion', values: payload }

    case 'arrayRemove':
      return { __type__: 'value', kind: 'arrayRemove', values: payload }

    case 'serverDate':
      const date = new Date()
      Object.assign(date, { __type__: 'value', kind: 'serverDate' })
      return date as ValueServerDate
  }
}

export { value }
