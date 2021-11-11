'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.onAll = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const doc_1 = require('../doc')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
/**
 * Subscribes to all documents in a collection.
 *
 * ```ts
 * import { onAll, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * onAll(users, allUsers => {
 *   console.log(allUsers.length)
 *   //=> 420
 *   console.log(allUsers[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(allUsers[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection to get all documents from
 * @param onResult - The function which is called with all documents array when
 * the initial fetch is resolved or the collection updates.
 * @param onError - The function is called with error when request fails.
 */
function onAll(collection, onResult, onError, options) {
  let unsubCalled = false
  let firebaseUnsub
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }
  ;(0, adaptor_1.default)().then((a) => {
    if (unsubCalled) return
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
    const processResults = (firestoreSnap) => {
      const docs = firestoreSnap.docs.map((snap) =>
        (0, doc_1.doc)(
          collection.__type__ === 'collectionGroup'
            ? (0, ref_1.pathToRef)(snap.ref.path)
            : (0, ref_1.ref)(collection, snap.id),
          (0, data_1.wrapData)(a, a.getDocData(snap, options)),
          Object.assign(
            {
              environment: a.environment,
              serverTimestamps:
                options === null || options === void 0
                  ? void 0
                  : options.serverTimestamps
            },
            a.getDocMeta(snap)
          )
        )
      )
      const changes = () =>
        firestoreSnap.docChanges().map((change) => ({
          type: change.type,
          oldIndex: change.oldIndex,
          newIndex: change.newIndex,
          doc:
            docs[
              change.type === 'removed' ? change.oldIndex : change.newIndex
            ] ||
            // If change.type indicates 'removed', sometimes(not all the time) `docs` does not
            // contain the removed document. In that case, we'll restore it from `change.doc`:
            (0, doc_1.doc)(
              collection.__type__ === 'collectionGroup'
                ? (0, ref_1.pathToRef)(change.doc.ref.path)
                : (0, ref_1.ref)(collection, change.doc.id),
              (0, data_1.wrapData)(a, a.getDocData(change.doc, options)),
              Object.assign(
                {
                  environment: a.environment,
                  serverTimestamps:
                    options === null || options === void 0
                      ? void 0
                      : options.serverTimestamps
                },
                a.getDocMeta(change.doc)
              )
            )
        }))
      onResult(docs, {
        changes,
        size: firestoreSnap.size,
        empty: firestoreSnap.empty
      })
    }
    const coll =
      collection.__type__ === 'collectionGroup'
        ? a.firestore.collectionGroup(collection.path)
        : a.firestore.collection(collection.path)
    firebaseUnsub =
      a.environment === 'web'
        ? coll.onSnapshot(
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
        : coll.onSnapshot(processResults, onError)
  })
  return unsub
}
exports.onAll = onAll
//# sourceMappingURL=index.js.map
