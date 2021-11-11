'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.onGet = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const doc_1 = require('../doc')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
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
function onGet(
  collectionOrRef,
  idOrOnResult,
  onResultOrOnError,
  maybeOnErrorOrOptions,
  maybeOptions
) {
  let unsubCalled = false
  let firebaseUnsub
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }
  let collection
  let id
  let onResult
  let onError
  let options
  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef
    id = idOrOnResult
    onResult = onResultOrOnError
    onError = maybeOnErrorOrOptions
    options = maybeOptions
  } else {
    const ref = collectionOrRef
    collection = ref.collection
    id = ref.id
    onResult = idOrOnResult
    onError = onResultOrOnError
    options = maybeOnErrorOrOptions
  }
  ;(0, adaptor_1.default)().then((a) => {
    const error = (0, assertEnvironment_1.environmentError)(
      a,
      options === null || options === void 0
        ? void 0
        : options.assertEnvironment
    )
    if (error) {
      onError === null || onError === void 0 ? void 0 : onError(error)
      return
    }
    if (unsubCalled) return
    const firestoreDoc = a.firestore.collection(collection.path).doc(id)
    const processResults = (firestoreSnap) => {
      const firestoreData = a.getDocData(firestoreSnap, options)
      const data = firestoreData && (0, data_1.wrapData)(a, firestoreData)
      onResult(
        (data &&
          (0, doc_1.doc)(
            (0, ref_1.ref)(collection, id),
            data,
            Object.assign(
              {
                environment: a.environment,
                serverTimestamps:
                  options === null || options === void 0
                    ? void 0
                    : options.serverTimestamps
              },
              a.getDocMeta(firestoreSnap)
            )
          )) ||
          null
      )
    }
    firebaseUnsub =
      a.environment === 'web'
        ? firestoreDoc.onSnapshot(
            // @ts-ignore: In the web environment, the first argument might be options
            {
              includeMetadataChanges:
                options === null || options === void 0
                  ? void 0
                  : options.includeMetadataChanges
            },
            processResults,
            // @ts-ignore
            onError
          )
        : firestoreDoc.onSnapshot(processResults, onError)
  })
  return unsub
}
exports.onGet = onGet
//# sourceMappingURL=index.js.map
