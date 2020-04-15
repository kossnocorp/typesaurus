import firestore from '../adaptor'
import { Collection } from '../collection'
import { unwrapData } from '../data'
import { Ref } from '../ref'
import { UpsetValue } from '../value'

/**
 * Type of the data passed to the merge function. It extends the model
 * making field values optional and allow to set value object.
 */
export type UpsetModel<Model> = {
  [Key in keyof Model]:
    | (Model[Key] extends object ? UpsetModel<Model[Key]> : Model[Key])
    | UpsetValue<Model[Key]>
}

/**
 * @param ref - the reference to the document to set or update
 * @param data - the document data
 */
async function upset<Model>(
  ref: Ref<Model>,
  data: UpsetModel<Model>
): Promise<void>

/**
 * @param collection - the collection to set or update
 * @param id - the id of the document to set or update
 * @param data - the document data
 */
async function upset<Model>(
  collection: Collection<Model>,
  id: string,
  data: UpsetModel<Model>
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
async function upset<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | UpsetModel<Model>,
  maybeData?: UpsetModel<Model>
): Promise<void> {
  let collection: Collection<Model>
  let id: string
  let data: UpsetModel<Model>

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeData as UpsetModel<Model>
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as UpsetModel<Model>
  }

  const firestoreDoc = firestore()
    .collection(collection.path)
    .doc(id)
  await firestoreDoc.set(unwrapData(data), { merge: true })
}

export default upset
