import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { wrapData } from '../data'

/**
 * Retrieves multiple documents from a collection.
 *
 * ```ts
 * import { getMany, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * getMany(users, ['00sHm46UWKObv2W7XK9e', '00sHm46UWKObv2W7XK0d']).then(user => {
 *   console.log(user)
 *   //=> [ { __type__: 'doc', data: { name: 'Sasha' }, ... }, { __type__: 'doc', data: { name: 'Thomas' }, ... }]
 * })
 * ```
 *
 * @returns Promise to a list of found documents
 */
async function getMany<Model>(
  collection: Collection<Model>,
  ids: readonly string[]
): Promise<Doc<Model>[]> {

  if (ids.length === 0) {
    // Firestore#getAll doesn't like empty lists
    return Promise.resolve([]);
  }

  const firestoreSnaps = await firestore().getAll(...ids.map(id => firestore().collection(collection.path).doc(id)));

  return firestoreSnaps.map(firestoreSnap => {
    const firestoreData = firestoreSnap.data()
    const data = firestoreData && (wrapData(firestoreData) as Model)
    return doc(ref(collection, firestoreSnap.id), data);
  }).filter(doc => doc != undefined) as Doc<Model>[];
}

export default getMany
