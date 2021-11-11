'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.onQuery = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const doc_1 = require('../doc')
const docId_1 = require('../docId')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
/**
 * Subscribes to a collection query built using query objects ({@link order | order}, {@link where | where}, {@link limit | limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * onQuery(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ], bornAfter2000 => {
 *   console.log(bornAfter2000)
 *   //=> 420
 *   console.log(bornAfter2000[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(bornAfter2000[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection or collection group to query
 * @param queries - The query objects
 * @param onResult - The function which is called with the query result when
 * the initial fetch is resolved or the query result updates.
 * @param onError - The function is called with error when request fails.
 * @returns Function that unsubscribes the listener from the updates
 */
function onQuery(collection, queries, onResult, onError, options) {
  let unsubCalled = false
  let firebaseUnsub
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }
  ;(0, adaptor_1.default)()
    .then((a) => {
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
      const { firestoreQuery, cursors } = queries.reduce(
        (acc, q) => {
          switch (q.type) {
            case 'order': {
              const { field, method, cursors } = q
              acc.firestoreQuery = acc.firestoreQuery.orderBy(
                field instanceof docId_1.DocId
                  ? a.consts.FieldPath.documentId()
                  : field.toString(),
                method
              )
              if (cursors)
                acc.cursors = acc.cursors.concat(
                  // @ts-ignore
                  cursors.map(({ method, value }) => ({
                    method,
                    value:
                      typeof value === 'object' &&
                      value !== null &&
                      '__type__' in value &&
                      value.__type__ === 'doc'
                        ? field instanceof docId_1.DocId
                          ? value.ref.id
                          : value.data[field]
                        : value
                  }))
                )
              break
            }
            case 'where': {
              const { field, filter, value } = q
              const fieldName = Array.isArray(field) ? field.join('.') : field
              acc.firestoreQuery = acc.firestoreQuery.where(
                fieldName instanceof docId_1.DocId
                  ? a.consts.FieldPath.documentId()
                  : fieldName,
                filter,
                (0, data_1.unwrapData)(a, value)
              )
              break
            }
            case 'limit': {
              const { number } = q
              acc.firestoreQuery = acc.firestoreQuery.limit(number)
              break
            }
          }
          return acc
        },
        {
          firestoreQuery:
            collection.__type__ === 'collectionGroup'
              ? a.firestore.collectionGroup(collection.path)
              : a.firestore.collection(collection.path),
          cursors: []
        }
      )
      const groupedCursors = cursors.reduce((acc, cursor) => {
        let methodValues = acc.find(([method]) => method === cursor.method)
        if (!methodValues) {
          methodValues = [cursor.method, []]
          acc.push(methodValues)
        }
        methodValues[1].push((0, data_1.unwrapData)(a, cursor.value))
        return acc
      }, [])
      const paginatedFirestoreQuery =
        cursors.length && cursors.every((cursor) => cursor.value !== undefined)
          ? groupedCursors.reduce((acc, [method, values]) => {
              return acc[method](...values)
            }, firestoreQuery)
          : firestoreQuery
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
      firebaseUnsub =
        a.environment === 'web'
          ? paginatedFirestoreQuery.onSnapshot(
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
          : paginatedFirestoreQuery.onSnapshot(processResults, onError)
    })
    .catch(onError)
  return unsub
}
exports.onQuery = onQuery
//# sourceMappingURL=index.js.map
