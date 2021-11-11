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
exports.add = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
/**
 * Adds a new document with a random id to a collection.
 *
 * ```ts
 * import { add, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const user = await add(users, { name: 'Sasha' })
 * console.log(user.id)
 * //=> '00sHm46UWKObv2W7XK9e'
 * ```
 *
 * @param collection - The collection to add to
 * @param data - The data to add to
 * @returns A promise to the ref
 */
function add(collection, data, options) {
  return __awaiter(this, void 0, void 0, function* () {
    const a = yield (0, adaptor_1.default)()
    ;(0,
    assertEnvironment_1.assertEnvironment)(a, options === null || options === void 0 ? void 0 : options.assertEnvironment)
    const firebaseDoc = yield a.firestore
      .collection(collection.path)
      .add((0, data_1.unwrapData)(a, data))
    return (0, ref_1.ref)(collection, firebaseDoc.id)
  })
}
exports.add = add
//# sourceMappingURL=index.js.map
