import firestore from '../adaptor'
import { Collection } from '../collection'
import { UpdateValue } from '../value'
import { Field } from '../field'
import { unwrapData } from '../data'
import { Ref } from '../ref'

/**
 * Type of the data passed to the update function. It extends the model
 * making values optional and allow to set value object.
 */
export type ModelUpdate<Model> = {
  [Key in keyof Model]?: Model[Key] | UpdateValue<Model[Key]>
}

/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: Field<Model>[]
): Promise<void>

/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
async function update<Model>(
  ref: Ref<Model>,
  data: Field<Model>[]
): Promise<void>

/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: ModelUpdate<Model>
): Promise<void>

/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
async function update<Model>(
  ref: Ref<Model>,
  data: ModelUpdate<Model>
): Promise<void>

/**
 * @returns a promise that resolves when operation is finished
 *
 * @example
 * import { update, collection } from 'typesaurus'
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
 *   ['name', 'Sasha Koss'],
 *   [['address', 'city'], 'Moscow']
 * ])
 */
async function update<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | Field<Model>[] | ModelUpdate<Model>,
  maybeData?: Field<Model>[] | ModelUpdate<Model>
): Promise<void> {
  let collection: Collection<Model>
  let id: string
  let data: Model

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeData as Model
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as Model
  }

  const firebaseDoc = firestore()
    .collection(collection.path)
    .doc(id)
  const updateData = Array.isArray(data)
    ? data.reduce(
        (acc, { key, value }) => {
          acc[Array.isArray(key) ? key.join('.') : key] = value
          return acc
        },
        {} as { [key: string]: any }
      )
    : data
  await firebaseDoc.update(unwrapData(updateData))
}

export default update
