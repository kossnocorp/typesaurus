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
function where(field, filter, value) {
    return {
        type: 'where',
        field,
        filter,
        value
    };
}
export { where };
//# sourceMappingURL=index.js.map