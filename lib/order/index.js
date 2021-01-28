"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.order = void 0;
/**
 * Creates order query object with given field, ordering method
 * and pagination cursors.
 *
 * ```ts
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
 * ```
 *
 * @returns The order query object
 */
function order(field, maybeMethod, maybeCursors) {
    let method = 'asc';
    let cursors;
    if (maybeMethod) {
        if (typeof maybeMethod === 'string') {
            method = maybeMethod;
            cursors = maybeCursors;
        }
        else {
            cursors = maybeMethod;
        }
    }
    return {
        type: 'order',
        field,
        method,
        cursors
    };
}
exports.order = order;
//# sourceMappingURL=index.js.map