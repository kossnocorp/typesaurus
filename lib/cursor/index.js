"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endAt = exports.endBefore = exports.startAt = exports.startAfter = void 0;
/**
 * Start the query results after the given value.
 *
 * ```ts
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
 * ```
 *
 * @param value - The value to end the query results after
 * @returns The cursor object
 */
function startAfter(value) {
    return {
        method: 'startAfter',
        value
    };
}
exports.startAfter = startAfter;
/**
 * Start the query results on the given value.
 *
 * ```ts
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
 * ```
 *
 * @param value - The value to start the query results at
 * @returns The cursor object
 */
function startAt(value) {
    return {
        method: 'startAt',
        value
    };
}
exports.startAt = startAt;
/**
 * Ends the query results before the given value.
 *
 * ```ts
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
 * ```
 *
 * @param value - The value to end the query results before
 * @returns The cursor object
 */
function endBefore(value) {
    return {
        method: 'endBefore',
        value
    };
}
exports.endBefore = endBefore;
/**
 * Ends the query results on the given value.
 *
 * ```ts
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
 * ```
 *
 * @param value - The value to end the query results at
 * @returns The cursor object
 */
function endAt(value) {
    return {
        method: 'endAt',
        value
    };
}
exports.endAt = endAt;
//# sourceMappingURL=index.js.map