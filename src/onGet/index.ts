import adaptor, { FirestoreDocumentSnapshot } from '../adaptor'
import type { Collection } from '../collection'
import { wrapData } from '../data'
import { AnyDoc, doc } from '../doc'
import { ref, Ref } from '../ref'
import type {
  DocOptions,
  OperationOptions,
  RealtimeOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy
} from '../types'
import { environmentError } from '../_lib/assertEnvironment'

export interface OnGetOptions<
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> extends DocOptions<ServerTimestamps>,
    OperationOptions<Environment>,
    RealtimeOptions {
  retry?: boolean | number[]
}

type OnResult<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> = (doc: AnyDoc<Model, Environment, boolean, ServerTimestamps> | null) => any

type OnError = (error: Error) => any

/**
 * @param ref - The reference to the document
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export function onGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model>,
  onResult: OnResult<Model, Environment, ServerTimestamps>,
  onError?: OnError,
  options?: OnGetOptions<Environment, ServerTimestamps>
): () => void

/**
 * @param collection - The document collection
 * @param id - The document id
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export function onGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  id: string,
  onResult: OnResult<Model, Environment, ServerTimestamps>,
  onError?: OnError,
  options?: OnGetOptions<Environment, ServerTimestamps>
): () => void

/**
 * Subscribes to the given document.
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
export function onGet<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrOnResult: string | OnResult<Model, Environment, ServerTimestamps>,
  onResultOrOnError?: OnResult<Model, Environment, ServerTimestamps> | OnError,
  maybeOnErrorOrOptions?: OnError | OnGetOptions<Environment, ServerTimestamps>,
  maybeOptions?: OnGetOptions<Environment, ServerTimestamps>
): () => void {
  let unsubCalled = false
  let firebaseUnsub: () => void
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }

  let collection: Collection<Model>
  let id: string
  let onResult: OnResult<Model, Environment, ServerTimestamps>
  let onError: OnError | undefined
  let options: OnGetOptions<Environment, ServerTimestamps> | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrOnResult as string
    onResult = onResultOrOnError as OnResult<
      Model,
      Environment,
      ServerTimestamps
    >
    onError = maybeOnErrorOrOptions as OnError | undefined
    options = maybeOptions as DocOptions<ServerTimestamps>
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    onResult = idOrOnResult as OnResult<Model, Environment, ServerTimestamps>
    onError = onResultOrOnError as OnError | undefined
    options = maybeOnErrorOrOptions as OnGetOptions<
      Environment,
      ServerTimestamps
    >
  }

  adaptor().then((a) => {
    const error = environmentError(a, options?.assertEnvironment)
    if (error) {
      onError?.(error)
      return
    }

    if (unsubCalled) return
    const firestoreDoc = a.firestore.collection(collection.path).doc(id)

    const processResults = (firestoreSnap: FirestoreDocumentSnapshot) => {
      const firestoreData = a.getDocData(firestoreSnap, options)
      const data = firestoreData && (wrapData(a, firestoreData) as Model)
      onResult(
        (data &&
          doc(ref(collection, id), data, {
            firestoreData: true,
            environment: a.environment as Environment,
            serverTimestamps: options?.serverTimestamps,
            ...a.getDocMeta(firestoreSnap)
          })) ||
          null
      )
    }

    const retryPattern =
      options?.retry === true
        ? defaultRetryPattern.concat([])
        : options && Array.isArray(options.retry)
        ? options.retry.concat([])
        : []

    function processError(error: Error) {
      if (missingRegExp.test(error.message) && retryPattern.length) {
        setTimeout(subscribe, retryPattern.shift())
      } else {
        onError?.(error)
      }
    }

    function subscribe() {
      unsub()
      firebaseUnsub =
        a.environment === 'web'
          ? firestoreDoc.onSnapshot(
              // @ts-ignore: In the web environment, the first argument might be options
              { includeMetadataChanges: options?.includeMetadataChanges },
              processResults,
              // @ts-ignore
              processError
            )
          : firestoreDoc.onSnapshot(processResults, processError)
    }

    subscribe()
  })

  return unsub
}

var defaultRetryPattern = [250, 500, 1000, 2000, 4000, 8000, 16000]

var missingRegExp = /Missing or insufficient permissions/
