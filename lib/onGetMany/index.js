'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.onGetMany = void 0
const adaptor_1 = __importDefault(require('../adaptor'))
const onGet_1 = require('../onGet')
const assertEnvironment_1 = require('../_lib/assertEnvironment')
/**
 * Subscribes to multiple documents from a collection.
 *
 * ```ts
 * import { onGetMany, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * onGetMany(contacts, [
 *   '07yQrsPK6ENtdEV3eaCE',
 *   '0qasibfFGVOQ4QYqUaQh',
 *   '11FrkclBWXo2BgnSsJNJ',
 * ], fewContacts => {
 *   console.log(fewContacts.length)
 *   //=> 3
 *   console.log(fewContacts[0].ref.id)
 *   //=> '07yQrsPK6ENtdEV3eaCE'
 *   console.log(fewContacts[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @returns Function that unsubscribes the listener from the updates
 */
function onGetMany(
  collection,
  ids,
  onResult,
  onError,
  // onMissing: ((id: string) => Model) | 'ignore' = id => {
  //   throw new Error(`Missing document with id ${id}`)
  // }
  options
) {
  let unsubCalled = false
  let firebaseUnsub
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }
  let waiting = ids.length
  const result = new Array(ids.length)
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
    if (ids.length === 0) {
      onResult([])
      return
    }
    const offs = ids.map((id, idIndex) =>
      (0, onGet_1.onGet)(
        collection,
        id,
        (doc) => {
          result[idIndex] = doc
          if (waiting) waiting--
          if (waiting === 0) {
            onResult(result)
          }
        },
        onError,
        options
      )
    )
    firebaseUnsub = () => offs.map((off) => off())
  })
  return unsub
}
exports.onGetMany = onGetMany
//# sourceMappingURL=index.js.map
