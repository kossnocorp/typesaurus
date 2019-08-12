import firestore from '../adaptor'
import { Collection } from '../collection'
import { Ref } from '../ref'

/**
 * @param collection - The collection to remove document in
 * @param id - The id of the documented to remove
 */
async function clear<Model>(
  collection: Collection<Model>,
  id: string
): Promise<void>

/**
 * @param ref - The reference to the document to remove
 */
async function clear<Model>(ref: Ref<Model>): Promise<void>

/**
 * Removes a document.
 *
 * @example
 * import { clear } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * clear(users, '00sHm46UWKObv2W7XK9e').then(() => console.log('Done!'))
 */
async function clear<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeId?: string
): Promise<void> {
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

  const firebaseDoc = firestore()
    .collection(collection.path)
    .doc(id)
  await firebaseDoc.delete()
}

export default clear
