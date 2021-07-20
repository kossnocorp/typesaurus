import type { FirestoreWhereFilterOp } from '../adaptor'
import { DocId } from '../docId'
import type { QueryModel } from '../types'

export interface WhereQuery<_Model> {
  type: 'where'
  field: string | string[] | DocId
  filter: FirestoreWhereFilterOp
  value: any
}

export type BasicWhereFilter = Exclude<
  FirestoreWhereFilterOp,
  'array-contains' | 'in'
>

// Basic filter variation
function where<Model, Key extends keyof QueryModel<Model>>(
  field: DocId,
  filter: BasicWhereFilter,
  value: string
): WhereQuery<Model>
// in variation
function where<Model, Key extends keyof QueryModel<Model>>(
  field: Key | [Key] | DocId,
  filter: 'in',
  value: string[]
): WhereQuery<Model>

// Basic filter variation
function where<Model, Key extends keyof QueryModel<Model>>(
  field: Key | [Key],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key extends keyof QueryModel<Model>,
  ValueArray extends QueryModel<Model>[Key],
  ValueType extends keyof ValueArray
>(
  field: Key | [Key],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<Model, Key extends keyof QueryModel<Model>>(
  field: Key | [Key],
  filter: 'in',
  value: QueryModel<Model>[Key][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1]
>(
  field: [Key1, Key2],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  ValueArray extends QueryModel<Model>[Key1][Key2],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1]
>(
  field: [Key1, Key2],
  filter: 'in',
  value: QueryModel<Model>[Key1][Key2][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2]
>(
  field: [Key1, Key2, Key3],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2][Key3]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  ValueArray extends QueryModel<Model>[Key1][Key2][Key3],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2]
>(
  field: [Key1, Key2, Key3],
  filter: 'in',
  value: QueryModel<Model>[Key1][Key2][Key3][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3]
>(
  field: [Key1, Key2, Key3, Key4],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2][Key3][Key4]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  ValueArray extends QueryModel<Model>[Key1][Key2][Key3][Key4],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3, Key4],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3]
>(
  field: [Key1, Key2, Key3, Key4],
  filter: 'in',
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4]
>(
  field: [Key1, Key2, Key3, Key4, Key5],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  ValueArray extends QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3, Key4, Key5],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4]
>(
  field: [Key1, Key2, Key3, Key4, Key5],
  filter: 'in',
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  ValueArray extends QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6],
  filter: 'in',
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  ValueArray extends QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7],
  filter: 'in',
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][Key7][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  ValueArray extends QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8],
  filter: 'in',
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9],
  filter: BasicWhereFilter,
  value: QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
  ValueArray extends QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9],
  filter: 'array-contains',
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9],
  filter: 'in',
  value: QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][]
): WhereQuery<Model>

// Basic filter variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
  Key10 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9, Key10],
  filter: BasicWhereFilter,
  value: QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][Key10]
): WhereQuery<Model>
// array-contains variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
  Key10 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9],
  ValueArray extends QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][Key10],
  ValueType extends keyof ValueArray
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9, Key10],
  filter: BasicWhereFilter,
  value: ValueArray[ValueType]
): WhereQuery<Model>
// in variation
function where<
  Model,
  Key1 extends keyof QueryModel<Model>,
  Key2 extends keyof QueryModel<Model>[Key1],
  Key3 extends keyof QueryModel<Model>[Key1][Key2],
  Key4 extends keyof QueryModel<Model>[Key1][Key2][Key3],
  Key5 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4],
  Key6 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof QueryModel<Model>[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
  Key10 extends keyof QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
>(
  field: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9, Key10],
  filter: 'in',
  value: QueryModel<
    Model
  >[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][Key10][]
): WhereQuery<Model>

/**
 * Creates where query.
 *
 * ```ts
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
 * ```
 *
 * @param field - The field or key path to query
 * @param filter - The filter operation ('<', '<=', '==', '>=', '>', 'array-contains', 'in' or 'array-contains-any')
 * @param value - The value to pass to the operation
 * @returns The where query object
 */
function where<Model>(
  field: string | string[] | DocId,
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
