/**
 * The limit query type. It contains the limit value.
 */
export interface LimitQuery {
    type: 'limit';
    number: number;
}
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
export declare function limit(number: number): LimitQuery;
