import { Ref } from '../ref'
import { Collection, collection } from '../collection'

/**
 * The subcollection function type.
 */
export type Subcollection<Model, ParentModel> = (
  ref: Ref<ParentModel> | string
) => Collection<Model>

export type NestedSubcollection<
  Model,
  ParentModel,
  ParentIds extends Array<string>
> = (ref: Ref<ParentModel> | ParentIds) => Collection<Model>

export function subcollection<Model, ParentModel>(
  name: string,
  parentCollection: Collection<ParentModel>
): Subcollection<Model, ParentModel>

export function subcollection<
  Model,
  SubcollectionModel,
  SubcollectionParentModel
>(
  name: string,
  parentSubcollection: Subcollection<
    SubcollectionModel,
    SubcollectionParentModel
  >
): NestedSubcollection<Model, SubcollectionModel, [string, string]>

export function subcollection<
  Model,
  SubcollectionModel,
  SubcollectionParentModel,
  SubcollectionIds extends [string, string]
>(
  name: string,
  parentSubcollection: NestedSubcollection<
    SubcollectionModel,
    SubcollectionParentModel,
    SubcollectionIds
  >
): NestedSubcollection<Model, SubcollectionModel, [string, string, string]>

export function subcollection<
  Model,
  SubcollectionModel,
  SubcollectionParentModel,
  SubcollectionIds extends [string, string, string]
>(
  name: string,
  parentSubcollection: NestedSubcollection<
    SubcollectionModel,
    SubcollectionParentModel,
    SubcollectionIds
  >
): NestedSubcollection<
  Model,
  SubcollectionModel,
  [string, string, string, string]
>

export function subcollection<
  Model,
  SubcollectionModel,
  SubcollectionParentModel,
  SubcollectionIds extends [string, string, string, string]
>(
  name: string,
  parentSubcollection: NestedSubcollection<
    SubcollectionModel,
    SubcollectionParentModel,
    SubcollectionIds
  >
): NestedSubcollection<
  Model,
  SubcollectionModel,
  [string, string, string, string, string]
>

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
 * const userOrders = subcollection<Order, User>('orders', users)
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
export function subcollection<Model, ParentModel>(
  name: string,
  parentCollection:
    | Collection<ParentModel>
    | Subcollection<Model, ParentModel>
    | NestedSubcollection<Model, ParentModel, string[]>
): any {
  // TODO: Throw an exception when a collection has different name
  return (ref: Ref<ParentModel> | string | string[]) => {
    let id: string
    let coll: Collection<any>

    if (Array.isArray(ref)) {
      const ids = ref
      id = ids.pop() as string
      coll =
        typeof parentCollection === 'function'
          ? (parentCollection as NestedSubcollection<any, any, string[]>)(ids)
          : parentCollection
    } else if (typeof ref === 'string') {
      id = ref
      coll = parentCollection as Collection<any>
    } else {
      id = ref.id
      coll = ref.collection
    }

    return collection<Model>(`${coll.path}/${id}/${name}`)
  }
}
