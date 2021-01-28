"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.group = void 0;
/**
 * Creates a collection group object.
 *
 * ```ts
 * import { group, subcollection, collection, ref } from 'typesaurus'
 *
 * type User = { name: string }
 * type Company = { name: string; address: string }
 * type Post = { author: Ref<User>; text: string; date?: Date }
 * const users = collection<User>('users')
 * const companies = collection<Company>('companies')
 * const posts = collection<Post>('posts')
 * const userPosts = subcollection<Post, User>('posts', users)
 * const companyPosts = subcollection<Post, User>('posts', companies)
 *
 * const allPosts = group('posts', [posts, userPosts, companyPosts])
 * //=> { __type__: 'collectionGroup', path: 'posts' }
 *
 * query(allPosts, [where('author', '==', ref(users, '00sHm46UWKObv2W7XK9e'))])
 * //=> Promise<Post[]>
 * ```
 *
 * @param name - The collection group name.
 * @param collections - The collections to create group from.
 */
function group(name, _collections) {
    return {
        __type__: 'collectionGroup',
        path: name
    };
}
exports.group = group;
//# sourceMappingURL=index.js.map