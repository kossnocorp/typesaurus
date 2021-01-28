"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adaptor_1 = __importDefault(require("../adaptor"));
const data_1 = require("../data");
const doc_1 = require("../doc");
const ref_1 = require("../ref");
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
function getMany(collection, ids, onMissing = (id) => {
    throw new Error(`Missing document with id ${id}`);
}) {
    return __awaiter(this, void 0, void 0, function* () {
        const a = yield adaptor_1.default();
        if (ids.length === 0) {
            // Firestore#getAll doesn't like empty lists
            return Promise.resolve([]);
        }
        const firestoreSnaps = yield a.firestore.getAll(...ids.map((id) => a.firestore.collection(collection.path).doc(id)));
        return firestoreSnaps
            .map((firestoreSnap) => {
            if (!firestoreSnap.exists) {
                if (onMissing === 'ignore') {
                    return null;
                }
                else {
                    return doc_1.doc(ref_1.ref(collection, firestoreSnap.id), onMissing(firestoreSnap.id), a.getDocMeta(firestoreSnap));
                }
            }
            const firestoreData = firestoreSnap.data();
            const data = firestoreData && data_1.wrapData(a, firestoreData);
            return doc_1.doc(ref_1.ref(collection, firestoreSnap.id), data, a.getDocMeta(firestoreSnap));
        })
            .filter((doc) => doc != null);
    });
}
exports.default = getMany;
//# sourceMappingURL=index.js.map