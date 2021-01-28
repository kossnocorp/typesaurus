"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collection = void 0;
/**
 * Creates a collection object.
 *
 * ```ts
 * import { add, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 * //=> { __type__: 'collection', path: 'users' }
 *
 * add(users, { name: 'Sasha' })
 * ```
 *
 * @param path - The collection path
 * @returns The collection object
 */
function collection(path) {
    return { __type__: 'collection', path };
}
exports.collection = collection;
//# sourceMappingURL=index.js.map