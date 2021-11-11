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
exports.all = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const doc_1 = require('../doc')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
/**
 * Returns all documents in a collection.
 *
 * ```ts
 * import { all, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * all(users).then(allUsers => {
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
 * @returns A promise to all documents
 */
function all(collection, options) {
  return __awaiter(this, void 0, void 0, function* () {
    const a = yield (0, adaptor_1.default)()
    ;(0,
    assertEnvironment_1.assertEnvironment)(a, options === null || options === void 0 ? void 0 : options.assertEnvironment)
    const firestoreQuery =
      collection.__type__ === 'collectionGroup'
        ? a.firestore.collectionGroup(collection.path)
        : a.firestore.collection(collection.path)
    const firebaseSnap = yield firestoreQuery.get()
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
exports.all = all
//# sourceMappingURL=index.js.map
