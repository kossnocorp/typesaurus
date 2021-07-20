import adaptor from '../adaptor'
import type { Collection } from '../collection'
import { wrapData } from '../data'
import { AnyDoc, doc } from '../doc'
import { ref } from '../ref'
import type {
  DocOptions,
  OnMissing,
  OnMissingOptions,
  OperationOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy
} from '../types'
import { assertEnvironment } from '../_lib/assertEnvironment'

export type GetManyOptions<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> = DocOptions<ServerTimestamps> &
  OperationOptions<Environment> &
  OnMissingOptions<Model>

export const defaultOnMissing: OnMissing<any> = (id) => {
  throw new Error(`Missing document with id ${id}`)
}

/**
 * Retrieves multiple documents from a collection.
 *
 * You can specify a strategy to handle missing documents by passing the `onMissing` argument.
 * By default, missing documents will throw an error. Other strategies:
 *
 *  * By providing `(id) => new MyModel(id, ...)`, you can provide a default value when a doc is missing
 *  * By providing `'ignore'`, missing documents are ignore and will be removed from the result
 *  * By providing `(id) => throw new CustomError(id)`, you can throw a a custom error
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
export async function getMany<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  ids: readonly string[],
  {
    onMissing = defaultOnMissing,
    ...options
  }: GetManyOptions<Model, Environment, ServerTimestamps> = {}
): Promise<AnyDoc<Model, Environment, boolean, ServerTimestamps>[]> {
  const a = await adaptor()

  assertEnvironment(a, options?.assertEnvironment)

  if (ids.length === 0) {
    // Firestore#getAll doesn't like empty lists
    return Promise.resolve([])
  }

  const firestoreSnaps = await a.firestore.getAll(
    ...ids.map((id) => a.firestore.collection(collection.path).doc(id))
  )

  return firestoreSnaps
    .map((firestoreSnap) => {
      if (!firestoreSnap.exists) {
        if (onMissing === 'ignore') {
          return null
        } else {
          return doc(
            ref(collection, firestoreSnap.id),
            onMissing(firestoreSnap.id),
            {
              environment: a.environment,
              serverTimestamps: options?.serverTimestamps,
              ...a.getDocMeta(firestoreSnap)
            }
          )
        }
      }

      const firestoreData = a.getDocData(firestoreSnap, options)
      const data = firestoreData && (wrapData(a, firestoreData) as Model)
      return doc(ref(collection, firestoreSnap.id), data, {
        environment: a.environment,
        serverTimestamps: options?.serverTimestamps,
        ...a.getDocMeta(firestoreSnap)
      })
    })
    .filter((doc) => doc != null) as AnyDoc<
    Model,
    Environment,
    boolean,
    ServerTimestamps
  >[]
}
