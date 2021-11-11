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
exports.set = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
/**
 * Sets a document to the given data.
 *
 * ```ts
 * import { set, get, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const userId = '00sHm46UWKObv2W7XK9e'
 * await set(users, userId, { name: 'Sasha Koss' })
 * console.log(await get(users, userId))
 * //=> { name: 'Sasha Koss' }
 * ```
 */
function set(collectionOrRef, idOrData, maybeDataOrOptions, maybeOptions) {
  return __awaiter(this, void 0, void 0, function* () {
    const a = yield (0, adaptor_1.default)()
    let collection
    let id
    let data
    let options
    if (collectionOrRef.__type__ === 'collection') {
      collection = collectionOrRef
      id = idOrData
      data = maybeDataOrOptions
      options = maybeOptions
    } else {
      const ref = collectionOrRef
      collection = ref.collection
      id = ref.id
      data = idOrData
      options = maybeDataOrOptions
    }
    ;(0,
    assertEnvironment_1.assertEnvironment)(a, options === null || options === void 0 ? void 0 : options.assertEnvironment)
    const firestoreDoc = a.firestore.collection(collection.path).doc(id)
    yield firestoreDoc.set((0, data_1.unwrapData)(a, data))
  })
}
exports.set = set
//# sourceMappingURL=index.js.map
