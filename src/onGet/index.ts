import adaptor from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { wrapData } from '../data'

type OnResult<Model> = (doc: Doc<Model> | null) => any

type OnError = (error: Error) => any

/**
 * @param ref - The reference to the document
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export default function onGet<Model>(
  ref: Ref<Model>,
  onResult: OnResult<Model>,
  onError?: OnError
): () => void

/**
 * @param collection - The document collection
 * @param id - The document id
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export default function onGet<Model>(
  collection: Collection<Model>,
  id: string,
  onResult: OnResult<Model>,
  onError?: OnError
): () => void

/**
 * Subscribes to the diven document.
 *
 * ```ts
 * import { onGet, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * onGet(users, '00sHm46UWKObv2W7XK9e', sasha => {
 *   console.log(sasha.ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(sasha.data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @returns Function that unsubscribes the listener from the updates
 */
export default function onGet<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrOnResult: string | OnResult<Model>,
  onResultOrOnError?: OnResult<Model> | OnError,
  maybeOnError?: OnError
): () => void {
  let unsubCalled = false
  let firebaseUnsub: () => void
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }

  let collection: Collection<Model>
  let id: string
  let onResult: OnResult<Model>
  let onError: OnError | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrOnResult as string
    onResult = onResultOrOnError as OnResult<Model>
    onError = maybeOnError
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    onResult = idOrOnResult as OnResult<Model>
    onError = onResultOrOnError as OnError | undefined
  }

  adaptor().then(a => {
    if (unsubCalled) return
    const firestoreDoc = a.firestore.collection(collection.path).doc(id)
    firebaseUnsub = firestoreDoc.onSnapshot(firestoreSnap => {
      const firestoreData = firestoreSnap.data()
      const data = firestoreData && (wrapData(a, firestoreData) as Model)
      onResult((data && doc(ref(collection, id), data)) || null)
    }, onError)
  })

  return unsub
}
