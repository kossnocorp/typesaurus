import adaptor from '../adaptor'
import type { Collection } from '../collection'
import { wrapData } from '../data'
import { AnyDoc, doc } from '../doc'
import type { CollectionGroup } from '../group'
import { pathToRef, ref } from '../ref'
import type {
  DocOptions,
  OperationOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy
} from '../types'
import { assertEnvironment } from '../_lib/assertEnvironment'

export type AllOptionns<
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> = DocOptions<ServerTimestamps> & OperationOptions<Environment>

/**
 * Returns all documents in a collection.
 *
 * ```ts
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
 * ```
 *
 * @param collection - The collection to get all documents from
 * @returns A promise to all documents
 */
export async function all<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model> | CollectionGroup<Model>,
  options?: AllOptionns<Environment, ServerTimestamps>
): Promise<AnyDoc<Model, Environment, boolean, ServerTimestamps>[]> {
  const a = await adaptor()

  assertEnvironment(a, options?.assertEnvironment)

  const firestoreQuery =
    collection.__type__ === 'collectionGroup'
      ? a.firestore.collectionGroup(collection.path)
      : a.firestore.collection(collection.path)
  const firebaseSnap = await firestoreQuery.get()

  return firebaseSnap.docs.map((snap) =>
    doc(
      collection.__type__ === 'collectionGroup'
        ? pathToRef(snap.ref.path)
        : ref(collection, snap.id),
      wrapData(a, a.getDocData(snap, options)) as Model,
      {
        environment: a.environment as Environment,
        serverTimestamps: options?.serverTimestamps,
        ...a.getDocMeta(snap)
      }
    )
  )
}
