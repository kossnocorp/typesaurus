import adaptor from '../adaptor'
import { ServerTimestampsStrategy } from '../adaptor/types'
import { Collection } from '../collection'
import { wrapData } from '../data'
import { AnyDoc, doc, Doc, DocOptions } from '../doc'
import { ref, Ref } from '../ref'

/**
 * @param ref - The reference to the document
 */
async function get<Model, ServerTimestamps extends ServerTimestampsStrategy>(
  ref: Ref<Model>,
  options?: {
    serverTimestamps?: ServerTimestamps
  }
): Promise<Doc<Model> | null>

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
async function get<Model, ServerTimestamps extends ServerTimestampsStrategy>(
  collection: Collection<Model>,
  id: string,
  options?: {
    serverTimestamps?: ServerTimestamps
  }
): Promise<Doc<Model> | null>

/**
 * Retrieves a document from a collection.
 *
 * ```ts
 * import { get, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * get(users, '00sHm46UWKObv2W7XK9e').then(user => {
 *   console.log(user)
 *   //=> { __type__: 'doc', data: { name: 'Sasha' }, ... }
 * })
 * // Or using ref:
 * get(currentUser.ref)
 * ```
 *
 * @returns Promise to the document or null if not found
 */
async function get<Model, ServerTimestamps extends ServerTimestampsStrategy>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeIdOrOptions?: string | DocOptions<ServerTimestamps>,
  maybeOptions?: DocOptions<ServerTimestamps>
): Promise<AnyDoc<Model, boolean, ServerTimestamps> | null> {
  const a = await adaptor()
  let collection: Collection<Model>
  let id: string
  let options: DocOptions<ServerTimestamps> | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeIdOrOptions as string
    options = maybeOptions
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    options = maybeIdOrOptions as
      | {
          serverTimestamps?: ServerTimestamps
        }
      | undefined
  }

  const firestoreDoc = a.firestore.collection(collection.path).doc(id)
  const firestoreSnap = await firestoreDoc.get()
  const firestoreData = a.getDocData(firestoreSnap, options)
  const data = firestoreData && (wrapData(a, firestoreData) as Model)
  return data
    ? doc(ref(collection, id), data, {
        environment: a.environment,
        serverTimestamps: options?.serverTimestamps,
        ...a.getDocMeta(firestoreSnap)
      })
    : null
}

export default get
