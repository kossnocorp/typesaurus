"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const onGet_1 = __importDefault(require("../onGet"));
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
function onGetMany(collection, ids, onResult, onError
// onMissing: ((id: string) => Model) | 'ignore' = id => {
//   throw new Error(`Missing document with id ${id}`)
// }
) {
    let waiting = ids.length;
    const result = new Array(ids.length);
    const offs = ids.map((id, idIndex) => onGet_1.default(collection, id, doc => {
        result[idIndex] = doc;
        if (waiting)
            waiting--;
        if (waiting === 0) {
            onResult(result);
        }
    }, onError));
    if (ids.length === 0)
        onResult([]);
    return () => offs.map(off => off());
}
exports.default = onGetMany;
//# sourceMappingURL=index.js.map