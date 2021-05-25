import adaptor from '../adaptor'
import { Collection } from '../collection'
import { Ref } from '../ref'

/**
 * @param ref - The reference to the document
 */
async function exists<Model>(ref: Ref<Model>): Promise<boolean>

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
async function exists<Model>(
  collection: Collection<Model>,
  id: string
): Promise<boolean>

/**
 * Checks if a document exists in a collection.
 *
 * ```ts
 * import { exists, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * exists(users, '00sHm46UWKObv2W7XK9e').then(userExists => {
 *   console.log(userExists)
 *   //=> true
 * })
 * // Or using ref:
 * exists(currentUser.ref)
 * ```
 *
 * @returns Promise to the document or null if not found
 */
async function exists<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeId?: string
): Promise<boolean> {
  const a = await adaptor()
  let collection: Collection<Model>
  let id: string

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeId as string
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
  }

  const firestoreDoc = a.firestore.collection(collection.path).doc(id)
  const firestoreSnap = await firestoreDoc.get()

  return firestoreSnap.exists
}

export default exists
