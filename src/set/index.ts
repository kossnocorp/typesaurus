import adaptor from '../adaptor'
import type { RuntimeEnvironment } from '../adaptor/types'
import type { Collection } from '../collection'
import { unwrapData } from '../data'
import type { Ref } from '../ref'
import type { WriteModel, WriteOptions } from '../types'
import assertEnvironment from '../_lib/assertEnvironment'

/**
 * @param ref - the reference to the document to set
 * @param data - the document data
 */
async function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  ref: Ref<Model>,
  data: WriteModel<Model, Environment>,
  options?: WriteOptions<Environment>
): Promise<void>

/**
 * @param collection - the collection to set document in
 * @param id - the id of the document to set
 * @param data - the document data
 */
async function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  collection: Collection<Model>,
  id: string,
  data: WriteModel<Model, Environment>,
  options?: WriteOptions<Environment>
): Promise<void>

/**
 * Sets a document to the given data.
 *
 * ```ts
 * import { set, get, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const userId = '00sHm46UWKObv2W7XK9e'
 * await set(users, userId, { name: 'Sasha Koss' })
 * console.log(await get(users, userId))
 * //=> { name: 'Sasha Koss' }
 * ```
 */
async function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | WriteModel<Model, Environment>,
  maybeDataOrOptions?:
    | WriteModel<Model, Environment>
    | WriteOptions<Environment>,
  maybeOptions?: WriteOptions<Environment>
): Promise<void> {
  const a = await adaptor()
  let collection: Collection<Model>
  let id: string
  let data: WriteModel<Model, Environment>
  let options: WriteOptions<Environment> | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeDataOrOptions as WriteModel<Model, Environment>
    options = maybeOptions
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as WriteModel<Model, Environment>
    options = maybeDataOrOptions as WriteOptions<Environment> | undefined
  }

  assertEnvironment(a, options?.assertEnvironment)

  const firestoreDoc = a.firestore.collection(collection.path).doc(id)
  await firestoreDoc.set(unwrapData(a, data))
}

export default set
