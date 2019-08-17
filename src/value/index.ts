/**
 * Available value kinds.
 */
export type ValueKind =
  | 'remove'
  | 'increment'
  | 'arrayUnion'
  | 'arrayRemove'
  | 'serverDate'

/**
 * The remove value type.
 */
export type ValueRemove = {
  __type__: 'value'
  kind: 'remove'
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
export type AnyUpdateValue = ValueRemove

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

function value(kind: 'remove'): ValueRemove

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
 * ```ts
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
 *     note: value('remove')
 *     // Add values to the interests
 *     interests: value('arrayUnion', ['skateboarding', 'minecraft'])
 *   })
 * })()
 * ```
 *
 * @param kind - The value kind ('remove', 'increment', 'arrayUnion', 'arrayRemove' or 'serverDate')
 * @param payload - The payload if required by the kind
 */
function value(
  kind: ValueKind | 'clear',
  payload?: any
):
  | ValueRemove
  | ValueIncrement
  | ValueArrayUnion
  | ValueArrayRemove
  | ValueServerDate {
  switch (kind) {
    case 'remove':
    case 'clear':
      return { __type__: 'value', kind: 'remove' }

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
