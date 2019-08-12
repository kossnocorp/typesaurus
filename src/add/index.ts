import firestore from '../adaptor'
import { Collection } from '../collection'
import { unwrapData } from '../data'
import { doc } from '../doc'
import { ref } from '../ref'

/**
 * Adds a new document with a random id to a collection.
 *
 * @param collection - The collection to add to
 * @param data - The data to add to
 * @returns A promise to the document
 *
 * @example
 * import { add, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * add(users, { name: 'Sasha' }).then(sasha => {
 *   console.log(sasha.ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(sasha.data)
 *   //=> { name: 'Sasha' }
 * })
 */
export default async function add<Model>(
  collection: Collection<Model>,
  data: Model
) {
  const firebaseDoc = await firestore()
    .collection(collection.path)
    .add(unwrapData(data))
  return doc<Model>(ref(collection, firebaseDoc.id), data)
}
