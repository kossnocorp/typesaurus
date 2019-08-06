import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { unwrapData } from '../data'

/**
 * @param ref - the reference to the document to set
 */
async function set<Model>(ref: Ref<Model>, data: Model): Promise<Doc<Model>>

/**
 * @param collection - the collection to set document in
 * @param id - the id of the document to set
 * @param data - the document data
 */
async function set<Model>(
  collection: Collection<Model>,
  id: string,
  data: Model
): Promise<Doc<Model>>

/**
 * Sets a document to the given data.
 *
 * @returns a promise to the document
 *
 * @example
 * import { set, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * set(users, '00sHm46UWKObv2W7XK9e', { name: 'Sasha Koss' }).then(sasha => {
 *   console.log(sasha.data)
 *   //=> { name: 'Sasha Koss' }
 * })
 */
async function set<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | Model,
  maybeData?: Model
): Promise<Doc<Model>> {
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

  const firestoreDoc = firestore()
    .collection(collection.path)
    .doc(id)
  await firestoreDoc.set(unwrapData(data))
  return doc(ref(collection, id), data)
}

export default set
