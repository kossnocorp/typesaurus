import firestore from '../adaptor'
import { Collection } from '../collection'

/**
 * The document reference type.
 */
export interface Ref<Model> {
  __type__: 'ref'
  collection: Collection<Model>
  id: string
}

/**
 * Creates reference object to a document in given collection with given id.
 *
 * @param collection - The collection to create refernce in
 * @param id - The document id
 * @returns The reference object
 *
 * @example
 * import { ref, query, collection, where, Ref } from 'typesaurus'
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
 */
export function ref<Model>(
  collection: Collection<Model>,
  id: string
): Ref<Model> {
  return { __type__: 'ref', collection, id }
}

/**
 * Generates Firestore path from a reference.
 *
 * @param ref - The reference to a document
 * @returns Firestore path
 */
export function getRefPath(ref: Ref<any>) {
  return [ref.collection.path].concat(ref.id).join('/')
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument<Model>(ref: Ref<Model>) {
  return firestore().doc(getRefPath(ref))
}

/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
export function pathToRef<Model>(path: string): Ref<Model> {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return {
    __type__: 'ref',
    collection: { __type__: 'collection', path: collectionPath },
    id
  }
}
