import adaptor from '../adaptor'
import type { Collection } from '../collection'
import { unwrapData } from '../data'
import type { Ref } from '../ref'
import { OperationOptions, RuntimeEnvironment, ServerDate } from '../types'
import { UpsetValue } from '../value'
import { assertEnvironment } from '../_lib/assertEnvironment'

export type UpsetOptions<
  Environment extends RuntimeEnvironment | undefined
> = OperationOptions<Environment>

/**
 * Type of the data passed to the upset function. It extends the model
 * allowing to set server date field value.
 */
export type UpsetModel<
  Model,
  Environment extends RuntimeEnvironment | undefined
> = {
  [Key in keyof Model]:
    | (Exclude<Model[Key], undefined> extends ServerDate // First, ensure ServerDate is properly set
        ? Environment extends 'node' // Date can be used only in the node environment
          ? Date | ServerDate
          : ServerDate
        : Model[Key] extends object // If it's an object, recursively pass through SetModel
        ? UpsetModel<Model[Key], Environment>
        : Model[Key])
    | UpsetValue<Model[Key]>
}

/**
 * @param ref - the reference to the document to set or update
 * @param data - the document data
 */
export async function upset<
  Model,
  Environment extends RuntimeEnvironment | undefined
>(
  ref: Ref<Model>,
  data: UpsetModel<Model, Environment>,
  options?: UpsetOptions<Environment>
): Promise<void>

/**
 * @param collection - the collection to set or update
 * @param id - the id of the document to set or update
 * @param data - the document data
 */
export async function upset<
  Model,
  Environment extends RuntimeEnvironment | undefined
>(
  collection: Collection<Model>,
  id: string,
  data: UpsetModel<Model, Environment>,
  options?: UpsetOptions<Environment>
): Promise<void>

/**
 * Sets a document to the given data or updates if it exists.
 *
 * ```ts
 * import { upset, update, get, collection } from 'typesaurus'
 *
 * type User = { name: string, deleted?: boolean }
 * const users = collection<User>('users')
 *
 * const userId = '00sHm46UWKObv2W7XK9e'
 * await upset(users, userId, { name: 'Sasha' })
 * await update(users, userId, { deleted: true })
 * await upset(users, userId, { name: 'Sasha Koss' })
 * console.log(await get(users, userId))
 * //=> { name: 'Sasha Koss', deleted: true }
 * ```
 */
export async function upset<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | UpsetModel<Model, Environment>,
  maybeDataOrOptions?:
    | UpsetModel<Model, Environment>
    | UpsetOptions<Environment>,
  maybeOptions?: UpsetOptions<Environment>
): Promise<void> {
  const a = await adaptor()
  let collection: Collection<Model>
  let id: string
  let data: UpsetModel<Model, Environment>
  let options: UpsetOptions<Environment> | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeDataOrOptions as UpsetModel<Model, Environment>
    options = maybeOptions!
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as UpsetModel<Model, Environment>
    options = maybeDataOrOptions as UpsetOptions<Environment>
  }

  assertEnvironment(a, options?.assertEnvironment)

  const firestoreDoc = a.firestore.collection(collection.path).doc(id)
  await firestoreDoc.set(unwrapData(a, data), { merge: true })
}
