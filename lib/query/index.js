'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.queryCommon = exports.query = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const doc_1 = require('../doc')
const docId_1 = require('../docId')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
/**
 * Queries passed collection using query objects ({@link order}, {@link where}, {@link limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ]).then(bornAfter2000 => {
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
 * @returns The promise to the query results
 */
function query(collection, queries, options) {
  return __awaiter(this, void 0, void 0, function* () {
    const a = yield (0, adaptor_1.default)()
    return queryCommon(collection, queries, options, { a, t: undefined })
  })
}
exports.query = query
function queryCommon(collection, queries, options, { a, t }) {
  return __awaiter(this, void 0, void 0, function* () {
    if (!t)
      (0, assertEnvironment_1.assertEnvironment)(
        a,
        options === null || options === void 0
          ? void 0
          : options.assertEnvironment
      )
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
                    value.__type__ == 'doc'
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
    const firebaseSnap = yield t
      ? t.get(paginatedFirestoreQuery)
      : paginatedFirestoreQuery.get()
    return firebaseSnap.docs.map((snap) =>
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
  })
}
exports.queryCommon = queryCommon
//# sourceMappingURL=index.js.map
