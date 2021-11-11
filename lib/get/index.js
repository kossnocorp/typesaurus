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
exports.getCommon = exports.get = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const doc_1 = require('../doc')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
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
function get(collectionOrRef, maybeIdOrOptions, maybeOptions) {
  return __awaiter(this, void 0, void 0, function* () {
    const a = yield (0, adaptor_1.default)()
    return getCommon(collectionOrRef, maybeIdOrOptions, maybeOptions, {
      a,
      t: undefined
    })
  })
}
exports.get = get
function getCommon(collectionOrRef, maybeIdOrOptions, maybeOptions, { a, t }) {
  return __awaiter(this, void 0, void 0, function* () {
    let collection
    let id
    let options
    if (collectionOrRef.__type__ === 'collection') {
      collection = collectionOrRef
      id = maybeIdOrOptions
      options = maybeOptions
    } else {
      const ref = collectionOrRef
      collection = ref.collection
      id = ref.id
      options = maybeIdOrOptions
    }
    if (!t)
      (0, assertEnvironment_1.assertEnvironment)(
        a,
        options === null || options === void 0
          ? void 0
          : options.assertEnvironment
      )
    const firestoreDoc = a.firestore.collection(collection.path).doc(id)
    const firestoreSnap = yield t ? t.get(firestoreDoc) : firestoreDoc.get()
    const firestoreData = a.getDocData(firestoreSnap, options)
    const data = firestoreData && (0, data_1.wrapData)(a, firestoreData)
    return data
      ? (0, doc_1.doc)(
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
        )
      : null
  })
}
exports.getCommon = getCommon
//# sourceMappingURL=index.js.map
