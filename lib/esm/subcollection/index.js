import { collection } from '../collection';
/**
 * Creates a subcollection function which accepts parent document reference or id
 * and returns the subcollection transformed into a collection object.
 *
 * ```ts
 * import { subcollection, collection, ref, add } from 'typesaurus'
 *
 * type User = { name: string }
 * type Order = { item: string }
 * const users = collection<User>('users')
 * const userOrders = subcollection<Order, User>('orders')
 *
 * const sashasOrders = userOrders('00sHm46UWKObv2W7XK9e')
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/orders' }
 * // Also accepts reference:
 * userOrders(ref(users, '00sHm46UWKObv2W7XK9e'))
 *
 * add(sashasOrders, { item: 'Snowboard boots' })
 * ```
 *
 * The subcollection function can be passed as the parent collection to
 * create nested subcollection:
 *
 * ```ts
 * import { subcollection, collection, ref, add, Ref } from 'typesaurus'
 *
 * type User = { name: string }
 * type Post = { author: Ref<User>; text: string; date?: Date }
 * type Comment = { author: Ref<User>; text: string; date?: Date }
 * type Like = { author: Ref<User> }
 *
 * const users = collection<User>('users')
 * const userPosts = subcollection<Post, User>('posts', users)
 * // Generic types:
 * // - Comment - the subcollection model
 * // - Post - the parent model
 * // - User - the grandparent model
 * const postComments = subcollection<Comment, Post, User>('comments', userPosts)
 * // Generic types:
 * // - Like - the subcollection model
 * // - Comment - the parent model
 * // - Post - the grandparent model
 * // - [string, string] - the ids type, a string for each level of nesting
 * const commentLikes = subcollection<Like, Comment, Post, [string, string]>(
 *   'likes',
 *   postComments
 * )
 *
 * // Using ids:
 *
 * const userId = '00sHm46UWKObv2W7XK9e'
 * const postId = '2ZWn8t4w2F3LVz2azVCN'
 * const commentId = 'UBHKjURqRZVpjvCwSKuO'
 *
 * userPosts(userId)
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/posts' }
 *
 * postComments([userId, postId])
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/posts/2ZWn8t4w2F3LVz2azVCN/comments' }
 *
 * commentLikes([userId, postId, commentId])
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/posts/2ZWn8t4w2F3LVz2azVCN/comments/UBHKjURqRZVpjvCwSKuO/likes' }
 *
 * // Or using refs:
 *
 * const user = ref(users, userId)
 * userPosts(user)
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/posts' }
 *
 * const post = ref(userPosts(user))
 * postComments(post)
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/posts/2ZWn8t4w2F3LVz2azVCN/comments' }
 *
 * const comment = ref(postComments(post))
 * commentLikes(comment)
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/posts/2ZWn8t4w2F3LVz2azVCN/comments/UBHKjURqRZVpjvCwSKuO/likes' }
 * ```
 *
 * @param name - The subcollection name
 * @param parentCollection - The parent collection, subcollection or nested subcollection
 * @returns Function which accepts parent document ref or id and returns collection object
 */
export function subcollection(name, parentCollection) {
    // TODO: Throw an exception when a collection has different name
    return (ref) => {
        let id;
        let coll;
        if (Array.isArray(ref)) {
            const ids = ref;
            id = ids.pop();
            coll =
                typeof parentCollection === 'function'
                    ? parentCollection(ids)
                    : parentCollection;
        }
        else if (typeof ref === 'string') {
            id = ref;
            coll = parentCollection;
        }
        else {
            id = ref.id;
            coll = ref.collection;
        }
        return collection(`${coll.path}/${id}/${name}`);
    };
}
//# sourceMappingURL=index.js.map