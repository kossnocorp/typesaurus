'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.limit = void 0
/**
 * Creates a limit query object. It's used to paginate queries.
 *
 * ```ts
 * import { limit, query, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ])
 * ```
 *
 * @param number - The limit value
 * @returns The limit object
 */
function limit(number) {
  return {
    type: 'limit',
    number
  }
}
exports.limit = limit
//# sourceMappingURL=index.js.map
