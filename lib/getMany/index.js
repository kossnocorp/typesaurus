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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {}
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p]
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]]
      }
    return t
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.getMany = exports.defaultOnMissing = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const data_1 = require('../data')
const doc_1 = require('../doc')
const ref_1 = require('../ref')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
const defaultOnMissing = (id) => {
  throw new Error(`Missing document with id ${id}`)
}
exports.defaultOnMissing = defaultOnMissing
/**
 * Retrieves multiple documents from a collection.
 *
 * You can specify a strategy to handle missing documents by passing the `onMissing` argument.
 * By default, missing documents will throw an error. Other strategies:
 *
 *  * By providing `(id) => new MyModel(id, ...)`, you can provide a default value when a doc is missing
 *  * By providing `'ignore'`, missing documents are ignore and will be removed from the result
 *  * By providing `(id) => throw new CustomError(id)`, you can throw a a custom error
 *
 * ```ts
 * import { getMany, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * getMany(users, ['00sHm46UWKObv2W7XK9e', '00sHm46UWKObv2W7XK0d']).then(user => {
 *   console.log(user)
 *   //=> [ { __type__: 'doc', data: { name: 'Sasha' }, ... }, { __type__: 'doc', data: { name: 'Thomas' }, ... }]
 * })
 * ```
 *
 * @returns Promise to a list of found documents
 */
function getMany(collection, ids, _a = {}) {
  var { onMissing = exports.defaultOnMissing } = _a,
    options = __rest(_a, ['onMissing'])
  return __awaiter(this, void 0, void 0, function* () {
    const a = yield (0, adaptor_1.default)()
    ;(0,
    assertEnvironment_1.assertEnvironment)(a, options === null || options === void 0 ? void 0 : options.assertEnvironment)
    if (ids.length === 0) {
      // Firestore#getAll doesn't like empty lists
      return Promise.resolve([])
    }
    const firestoreSnaps = yield a.firestore.getAll(
      ...ids.map((id) => a.firestore.collection(collection.path).doc(id))
    )
    return firestoreSnaps
      .map((firestoreSnap) => {
        if (!firestoreSnap.exists) {
          if (onMissing === 'ignore') {
            return null
          } else {
            return (0, doc_1.doc)(
              (0, ref_1.ref)(collection, firestoreSnap.id),
              onMissing(firestoreSnap.id),
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
          }
        }
        const firestoreData = a.getDocData(firestoreSnap, options)
        const data = firestoreData && (0, data_1.wrapData)(a, firestoreData)
        return (0, doc_1.doc)(
          (0, ref_1.ref)(collection, firestoreSnap.id),
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
      })
      .filter((doc) => doc != null)
  })
}
exports.getMany = getMany
//# sourceMappingURL=index.js.map
