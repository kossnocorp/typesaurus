import { Collection } from '../collection'
import firestore from '../adaptor'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { wrapData } from '../data'

/**
 * Returns all documents in a collection.
 *
 * @param collection  - the collection to get all documents from
 * @returns a promise to all documents
 *
 * @example
 * import { all, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * all(users).then(allUsers => {
 *   console.log(allUsers.length)
 *   //=> 420
 *   console.log(allUsers[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(allUsers[0].data)
 *   //=> { name: 'Sasha' }
 * })
 */
export default async function all<Model>(
  collection: Collection<Model>
): Promise<Doc<Model>[]> {
  const firebaseSnap = await firestore()
    .collection(collection.path)
    .get()
  return firebaseSnap.docs.map(d =>
    doc(ref(collection, d.id), wrapData(d.data()) as Model)
  )
}
