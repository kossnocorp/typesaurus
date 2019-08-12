/**
 * Available cursor methods.
 */
export type CursorMethod = 'startAfter' | 'startAt' | 'endBefore' | 'endAt'

/**
 * The cursor interface, holds the method and the value for pagination.
 */
export interface Cursor<Model, Key extends keyof Model> {
  method: CursorMethod
  value: Model[Key] | /*Ref<Model> |*/ undefined
}

/**
 * Start the query results after the given value.
 *
 * @param value - The value to end the query results after
 * @returns The cursor object
 *
 * @example
 * import { startAfter, order, query, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [order('year', 'asc', [startAfter(1999)])])
 *   .then(youngerThan2K => {
 *     console.log(youngerThan2K.length)
 *     //=> 420
 *   })
 */
export function startAfter<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'startAfter',
    value
  }
}

/**
 * Start the query results on the given value.
 *
 * @param value - The value to start the query results at
 * @returns The cursor object
 *
 * @example
 * import { startAt, order, query, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [order('year', 'asc', [startAt(2000)])])
 *   .then(youngerThan2K => {
 *     console.log(youngerThan2K.length)
 *     //=> 420
 *   })
 */
export function startAt<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'startAt',
    value
  }
}

/**
 * Ends the query results before the given value.
 *
 * @param value - The value to end the query results before
 * @returns The cursor object
 *
 * @example
 * import { endBefore, order, query, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [order('year', 'asc', [endBefore(2000)])])
 *   .then(olderThan2K => {
 *     console.log(olderThan2K.length)
 *     //=> 420
 *   })
 */
export function endBefore<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'endBefore',
    value
  }
}

/**
 * Ends the query results on the given value.
 *
 * @param value - The value to end the query results at
 * @returns The cursor object
 *
 * @example
 * import { endAt, order, query, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [order('year', 'asc', [endAt(1999)])])
 *   .then(olderThan2K => {
 *     console.log(olderThan2K.length)
 *     //=> 420
 *   })
 */
export function endAt<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'endAt',
    value
  }
}
