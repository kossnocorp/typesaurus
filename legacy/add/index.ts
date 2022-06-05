import adaptor from '../adaptor'
import type { Collection } from '../collection'
import { unwrapData } from '../data'
import { ref } from '../ref'
import type { OperationOptions, RuntimeEnvironment, WriteModel } from '../types'
import { assertEnvironment } from '../_lib/assertEnvironment'

export type AddOptions<
  Environment extends RuntimeEnvironment | undefined
> = OperationOptions<Environment>

/**
 * Adds a new document with a random id to a collection.
 *
 * ```ts
 * import { add, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const user = await add(users, { name: 'Sasha' })
 * console.log(user.id)
 * //=> '00sHm46UWKObv2W7XK9e'
 * ```
 *
 * @param collection - The collection to add to
 * @param data - The data to add to
 * @returns A promise to the ref
 */
export async function add<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  collection: Collection<Model>,
  data: WriteModel<Model, Environment>,
  options?: OperationOptions<Environment>
) {
  const a = await adaptor()

  assertEnvironment(a, options?.assertEnvironment)

  const firebaseDoc = await a.firestore
    .collection(collection.path)
    .add(unwrapData(a, data))
  return ref(collection, firebaseDoc.id)
}
