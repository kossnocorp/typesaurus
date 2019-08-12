import { FirestoreOrderByDirection } from '../adaptor'
import { Cursor } from '../cursor'

/**
 * The order query type. Used to build query.
 */
export interface OrderQuery<Model, Key extends keyof Model> {
  type: 'order'
  field: Key
  method: FirestoreOrderByDirection
  cursors: Cursor<Model, Key>[] | undefined
}

/**
 * @param field - Apply ascending order on given field
 */
function order<Model, Key extends keyof Model>(
  field: Key
): OrderQuery<Model, Key>

/**
 * @param field - Apply ascending order on given field with given cursors
 * @param cursors - Cursors that define pagination rules ({@link startAfter}, {@link startAt}, {@link endBefore} and {@link endAt})
 */
function order<Model, Key extends keyof Model>(
  field: Key,
  cursors: Cursor<Model, Key>[]
): OrderQuery<Model, Key>

/**
 *
 * @param field Apply the order to the field
 * @param method Used ordering method ('desc' or 'asc')
 * @param cursors - Cursors that define pagination rules ({@link startAfter}, {@link startAt}, {@link endBefore} and {@link endAt})
 */
function order<Model, Key extends keyof Model>(
  field: Key,
  method: FirestoreOrderByDirection,
  cursors?: Cursor<Model, Key>[]
): OrderQuery<Model, Key>

/**
 * Creates order query object with given field, ordering method
 * and pagination cursors.
 *
 * @returns The order query object
 *
 * @example
 * import { order, query, limit, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   //=> {
 *   //=>   type: 'order',
 *   //=>   field: 'year',
 *   //=>   method: 'asc',
 *   //=>   cursors: [{ method: 'startAt', value: 2000 }]
 *   //=> }
 *   limit(2)
 * ]).then(bornAfter2000 => {
 *   console.log(bornAfter2000)
 *   //=> 420
 * })
 */
function order<Model, Key extends keyof Model>(
  field: Key,
  maybeMethod?: FirestoreOrderByDirection | Cursor<Model, Key>[],
  maybeCursors?: Cursor<Model, Key>[]
): OrderQuery<Model, Key> {
  let method: FirestoreOrderByDirection = 'asc'
  let cursors

  if (maybeMethod) {
    if (typeof maybeMethod === 'string') {
      method = maybeMethod
      cursors = maybeCursors
    } else {
      cursors = maybeMethod
    }
  }

  return {
    type: 'order',
    field,
    method,
    cursors
  }
}

export { order }
