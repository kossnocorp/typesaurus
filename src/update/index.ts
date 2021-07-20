import adaptor from '../adaptor'
import type { Collection } from '../collection'
import { unwrapData } from '../data'
import type { Field } from '../field'
import type { Ref } from '../ref'
import type { OperationOptions, RuntimeEnvironment } from '../types'
import type { UpdateValue } from '../value'
import { assertEnvironment } from '../_lib/assertEnvironment'

export type UpdateOptions<
  Environment extends RuntimeEnvironment | undefined
> = OperationOptions<Environment>

/**
 * Type of the data passed to the update function. It extends the model
 * making values optional and allow to set value object.
 */
export type UpdateModel<Model> = {
  [Key in keyof Model]?: UpdateModel<Model[Key]> | UpdateValue<Model, Key>
}

/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
export async function update<
  Model,
  Environment extends RuntimeEnvironment | undefined
>(
  collection: Collection<Model>,
  id: string,
  data: Field<Model>[],
  options?: UpdateOptions<Environment>
): Promise<void>

/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
export async function update<
  Model,
  Environment extends RuntimeEnvironment | undefined
>(
  ref: Ref<Model>,
  data: Field<Model>[],
  options?: UpdateOptions<Environment>
): Promise<void>

/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
export async function update<
  Model,
  Environment extends RuntimeEnvironment | undefined
>(
  collection: Collection<Model>,
  id: string,
  data: UpdateModel<Model>,
  options?: UpdateOptions<Environment>
): Promise<void>

/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
export async function update<
  Model,
  Environment extends RuntimeEnvironment | undefined
>(
  ref: Ref<Model>,
  data: UpdateModel<Model>,
  options?: UpdateOptions<Environment>
): Promise<void>

/**
 * Updates a document.
 *
 * ```ts
 * import { update, field, collection } from 'typesaurus'
 *
 * type User = {
 *   name: string,
 *   address: {
 *     country: string,
 *     city: string
 *   }
 * }
 *
 * const users = collection<User>('users')
 *
 * update(users, '00sHm46UWKObv2W7XK9e', { name: 'Sasha Koss' })
 *   .then(() => console.log('Done!'))
 * // or using key paths:
 * update(users, '00sHm46UWKObv2W7XK9e', [
 *   field('name', 'Sasha Koss'),
 *   field(['address', 'city'], 'Moscow')
 * ])
 * ```
 *
 * @returns A promise that resolves when the operation is finished
 */
export async function update<
  Model,
  Environment extends RuntimeEnvironment | undefined
>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | Field<Model>[] | UpdateModel<Model>,
  maybeDataOrOptions?:
    | Field<Model>[]
    | UpdateModel<Model>
    | UpdateOptions<Environment>,
  maybeOptions?: UpdateOptions<Environment>
): Promise<void> {
  const a = await adaptor()
  let collection: Collection<Model>
  let id: string
  let data: UpdateModel<Model>
  let options: UpdateOptions<Environment> | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeDataOrOptions as UpdateModel<Model>
    options = maybeOptions!
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as UpdateModel<Model>
    options = maybeDataOrOptions as UpdateOptions<Environment>
  }

  assertEnvironment(a, options?.assertEnvironment)

  const firebaseDoc = a.firestore.collection(collection.path).doc(id)
  const updateData = Array.isArray(data)
    ? data.reduce((acc, { key, value }) => {
        acc[Array.isArray(key) ? key.join('.') : key] = value
        return acc
      }, {} as { [key: string]: any })
    : data
  await firebaseDoc.update(unwrapData(a, updateData))
}
