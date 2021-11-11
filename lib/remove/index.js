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
exports.remove = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
/**
 * Removes a document.
 *
 * ```ts
 * import { remove } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * remove(users, '00sHm46UWKObv2W7XK9e').then(() => console.log('Done!'))
 * ```
 *
 * @returns A promise that resolves when the operation is complete
 */
function remove(collectionOrRef, maybeId) {
  return __awaiter(this, void 0, void 0, function* () {
    const a = yield (0, adaptor_1.default)()
    let collection
    let id
    if (collectionOrRef.__type__ === 'collection') {
      collection = collectionOrRef
      id = maybeId
    } else {
      const ref = collectionOrRef
      collection = ref.collection
      id = ref.id
    }
    const firebaseDoc = a.firestore.collection(collection.path).doc(id)
    yield firebaseDoc.delete()
  })
}
exports.remove = remove
//# sourceMappingURL=index.js.map
