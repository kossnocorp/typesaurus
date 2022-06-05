import { Collection } from '../collection'
import { Subcollection, NestedSubcollection } from '../subcollection'

/**
 * The collection group type. It contains the collection name.
 */
export interface CollectionGroup<_Model> {
  __type__: 'collectionGroup'
  path: string
}

type CollectionEntity<Model> =
  | Collection<Model>
  | Subcollection<Model, any>
  | NestedSubcollection<Model, any, any>

function group<A>(
  path: string,
  collections: [CollectionEntity<A>]
): CollectionGroup<A>

function group<A, B>(
  path: string,
  collections: [CollectionEntity<A>, CollectionEntity<B>]
): CollectionGroup<A | B>

function group<A, B, C>(
  path: string,
  collections: [CollectionEntity<A>, CollectionEntity<B>, CollectionEntity<C>]
): CollectionGroup<A | B | C>

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
function group(
  name: string,
  _collections: CollectionEntity<any>[]
): CollectionGroup<unknown> {
  return {
    __type__: 'collectionGroup',
    path: name
  }
}

export { group }
