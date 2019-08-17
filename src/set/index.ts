import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { unwrapData } from '../data'

interface SetOptions {
  merge?: boolean
}

/**
 * @param ref - the reference to the document to set
 * @param options - { merge: boolean (default: false) }
 */
async function set<Model>(
  ref: Ref<Model>,
  data: Model,
  options?: SetOptions
): Promise<Doc<Model>>

/**
 * @param collection - the collection to set document in
 * @param id - the id of the document to set
 * @param data - the document data
 * @param options - { merge: boolean (default: false) }
 */
async function set<Model>(
  collection: Collection<Model>,
  id: string,
  data: Model,
  options?: SetOptions
): Promise<Doc<Model>>

/**
 * Sets a document to the given data.
 *
 * ```ts
 * import { set, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * set(users, '00sHm46UWKObv2W7XK9e', { name: 'Sasha Koss' }).then(sasha => {
 *   console.log(sasha.data)
 *   //=> { name: 'Sasha Koss' }
 * })
 * ```
 *
 * You can also preseve current fields not specified by set:
 *
 * ```ts
 * import { set, value, get, collection } from 'typesaurus'
 *
 * type User = { name: string, registedAt: Date }
 * const users = collection<User>('users')
 *
 * set(users, '00sHm46UWKObv2W7XK9e', {
 *   name: 'Sasha',
 *   registedAt: value('serverDate')
 * },
 *
 * set(
 *   users,
 *  '00sHm46UWKObv2W7XK9e',
 *   { name: 'Sasha Koss' },
 *   { merge: true }
 * )
 *   .then(({ ref }) => get(ref))
 *   .then(console.log)
 *   //=> { name: 'Sasha Koss', registedAt: Thu Aug 15 2019 16:16:56 GMT+0200 (Central European Summer Time) }
 * ```
 *
 * @returns A promise to the document
 */
async function set<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | Model,
  dataOrOptions?: Model | SetOptions,
  maybeOptions?: SetOptions
): Promise<Doc<Model>> {
  let collection: Collection<Model>
  let id: string
  let data: Model
  let options: FirebaseFirestore.SetOptions | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = dataOrOptions as Model
    options = maybeOptions as SetOptions | undefined
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as Model
    options = dataOrOptions as FirebaseFirestore.SetOptions | undefined
  }

  const firestoreDoc = firestore()
    .collection(collection.path)
    .doc(id)
  await firestoreDoc.set(unwrapData(data), options)
  return doc(ref(collection, id), data)
}

export default set
