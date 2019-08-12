import { FirestoreWhereFilterOp } from '../adaptor'

export interface WhereQuery<_Model> {
  type: 'where'
  field: string | string[]
  filter: FirestoreWhereFilterOp
  value: any
}

function where<Model, Key extends keyof Model>(
  field: Key | [Key],
  filter: FirestoreWhereFilterOp,
  value: Model[Key]
): WhereQuery<Model>

function where<Model, Key1 extends keyof Model, Key2 extends keyof Model[Key1]>(
  field: [Key1, Key2],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2]
>(
  field: [Key1, Key2, Key3],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3]
>(
  field: [Key1, Key2, Key3, Key4],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3][Key4]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4]
>(
  field: [Key1, Key2, Key3, Key4, Key5],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3][Key4][Key5]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
): WhereQuery<Model>

function where<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
  Key10 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9, Key10],
  filter: FirestoreWhereFilterOp,
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][Key10]
): WhereQuery<Model>

/**
 * Creates where query.
 *
 * @param field - The field or key path to query
 * @param filter - The filter operation ('<', '<=', '==', '>=' or '>')
 * @param value - The value to pass to the operation
 * @returns The where query object
 *
 * @example
 * import { where, ref, query, collection, Ref } from 'typesaurus'
 *
 * type User = { name: string }
 * type Order = { user: Ref<User>, item: string }
 * const users = collection<User>('users')
 * const orders = collection<User>('orders')
 *
 * query(orders, [where('user', '==', ref(users, '00sHm46UWKObv2W7XK9e')])
 *   .then(userOrders => {
 *     console.log(userOrders.length)
 *     //=> 42
 *   })
 * // Or using key paths:
 * query(orders, [where(['address', 'city'], '==', 'Moscow'])
 */
function where<Model>(
  field: string | string[],
  filter: FirestoreWhereFilterOp,
  value: any
): WhereQuery<Model> {
  return {
    type: 'where',
    field,
    filter,
    value
  }
}

export { where }

/**
 * Creates where query with array-contains filter operation.
 *
 * @param field - The field or key path to query
 * @param value - The value to pass to the operation
 * @returns The where query object
 *
 * @example
 * import { untypedWhereArrayContains, query, collection } from 'typesaurus'
 *
 * type User = {
 *   name: string,
 *   interests: string[]
 * }
 *
 * const users = collection<User>('users')
 *
 * query(users, [untypedWhereArrayContains('interests', 'snowboarding'])
 *   .then(snowborders => {
 *     console.log(snowboarders.length)
 *     //=> 42
 *   })
 */
export function untypedWhereArrayContains<Model>(
  field: string | string[],
  value: any
): WhereQuery<Model> {
  return {
    type: 'where',
    field,
    filter: 'array-contains',
    value
  }
}
