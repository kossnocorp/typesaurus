import firestore from '../adaptor'
import { Collection } from '../collection'
import { unwrapData } from '../data'
import { Ref } from '../ref'
import { SetValue } from '../value'

/**
 * Type of the data passed to the set function. It extends the model
 * allowing to set server date field value.
 */
export type SetModel<Model> = {
  [Key in keyof Model]:
    | (Model[Key] extends object ? SetModel<Model[Key]> : Model[Key])
    | SetValue<Model[Key]>
}

/**
 * @param ref - the reference to the document to set
 * @param data - the document data
 */
async function set<Model>(ref: Ref<Model>, data: SetModel<Model>): Promise<void>

/**
 * @param collection - the collection to set document in
 * @param id - the id of the document to set
 * @param data - the document data
 */
async function set<Model>(
  collection: Collection<Model>,
  id: string,
  data: SetModel<Model>
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
async function set<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | SetModel<Model>,
  maybeData?: SetModel<Model>
): Promise<void> {
  let collection: Collection<Model>
  let id: string
  let data: SetModel<Model>

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeData as SetModel<Model>
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as SetModel<Model>
  }

  const firestoreDoc = firestore()
    .collection(collection.path)
    .doc(id)
  await firestoreDoc.set(unwrapData(data))
}

export default set
