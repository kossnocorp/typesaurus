import adaptor, { Adaptor } from '../adaptor'
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
 * ```ts
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
 * ```
 *
 * When id param is not passed it will be automatically generated:
 *
 * ```ts
 * import { ref, set, Ref } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const id = ref(users).id
 * set(users, id, {name: 'John Doe'})
 * ```
 *
 * @param collection - The collection to create refernce in
 * @param id=RANDOM_ID - The document id; generated when not passed
 * @returns The reference object
 */
export function ref<Model>(
  collection: Collection<Model>,
  id: string
): Ref<Model> {
  return { __type__: 'ref', collection, id }
}

export async function id(collection: Collection<any>) {
  const a = await adaptor()
  return a.firestore.collection(collection.path).doc().id
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
export function refToFirestoreDocument<Model>(
  { firestore }: Adaptor,
  ref: Ref<Model>
) {
  return firestore.doc(getRefPath(ref))
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
