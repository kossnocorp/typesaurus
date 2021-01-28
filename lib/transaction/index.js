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
exports.transaction = void 0;
const adaptor_1 = __importDefault(require("../adaptor"));
const data_1 = require("../data");
const doc_1 = require("../doc");
const ref_1 = require("../ref");
/**
 * The function allows performing transactions. It accepts two functions.
 * The first receives {@link TransactionRead|transaction read API} that allows
 * getting data from the database and pass it to the second function.
 * The second function gets {@link TransactionWrite|transaction write API}
 * with the data returned from the first function as `data` property of the argument.
 *
 * ```ts
 * import { transaction, collection } from 'typesaurus'
 *
 * type Counter = { count: number }
 * const counters = collection<Counter>('counters')
 *
 * transaction(
 *   ({ get }) => get('420'),
 *   ({ data: counter, update }) =>
 *     update(counter.ref, { count: counter.data.count + 1 })
 * )
 * ```
 *
 * @param readFunction - the transaction read function that accepts transaction
 *   read API and returns data for write function
 * @param writeFunction - the transaction write function that accepts
 *   transaction write API with the data returned by the read function
 * @returns Promise that is resolved when transaction is closed
 */
function transaction(readFunction, writeFunction) {
    return __awaiter(this, void 0, void 0, function* () {
        const a = yield adaptor_1.default();
        return a.firestore.runTransaction((t) => {
            function get(collectionOrRef, maybeId) {
                return __awaiter(this, void 0, void 0, function* () {
                    let collection;
                    let id;
                    if (collectionOrRef.__type__ === 'collection') {
                        collection = collectionOrRef;
                        id = maybeId;
                    }
                    else {
                        const ref = collectionOrRef;
                        collection = ref.collection;
                        id = ref.id;
                    }
                    const firestoreDoc = a.firestore.collection(collection.path).doc(id);
                    // ^ above
                    // TODO: Refactor code above and below because is all the same as in the regular get function
                    const firestoreSnap = yield t.get(firestoreDoc);
                    // v below
                    const firestoreData = firestoreSnap.data();
                    const data = firestoreData && data_1.wrapData(a, firestoreData);
                    return data
                        ? doc_1.doc(ref_1.ref(collection, id), data, a.getDocMeta(firestoreSnap))
                        : null;
                });
            }
            function set(collectionOrRef, idOrData, maybeData) {
                let collection;
                let id;
                let data;
                if (collectionOrRef.__type__ === 'collection') {
                    collection = collectionOrRef;
                    id = idOrData;
                    data = maybeData;
                }
                else {
                    const ref = collectionOrRef;
                    collection = ref.collection;
                    id = ref.id;
                    data = idOrData;
                }
                const firestoreDoc = a.firestore.collection(collection.path).doc(id);
                // ^ above
                // TODO: Refactor code above and below because is all the same as in the regular set function
                t.set(firestoreDoc, data_1.unwrapData(a, data));
            }
            function upset(collectionOrRef, idOrData, maybeData) {
                let collection;
                let id;
                let data;
                if (collectionOrRef.__type__ === 'collection') {
                    collection = collectionOrRef;
                    id = idOrData;
                    data = maybeData;
                }
                else {
                    const ref = collectionOrRef;
                    collection = ref.collection;
                    id = ref.id;
                    data = idOrData;
                }
                const firestoreDoc = a.firestore.collection(collection.path).doc(id);
                // ^ above
                // TODO: Refactor code above and below because is all the same as in the regular set function
                t.set(firestoreDoc, data_1.unwrapData(a, data), { merge: true });
            }
            function update(collectionOrRef, idOrData, maybeData) {
                let collection;
                let id;
                let data;
                if (collectionOrRef.__type__ === 'collection') {
                    collection = collectionOrRef;
                    id = idOrData;
                    data = maybeData;
                }
                else {
                    const ref = collectionOrRef;
                    collection = ref.collection;
                    id = ref.id;
                    data = idOrData;
                }
                const firebaseDoc = a.firestore.collection(collection.path).doc(id);
                const updateData = Array.isArray(data)
                    ? data.reduce((acc, { key, value }) => {
                        acc[Array.isArray(key) ? key.join('.') : key] = value;
                        return acc;
                    }, {})
                    : data;
                // ^ above
                // TODO: Refactor code above because is all the same as in the regular update function
                t.update(firebaseDoc, data_1.unwrapData(a, updateData));
            }
            function remove(collectionOrRef, maybeId) {
                let collection;
                let id;
                if (collectionOrRef.__type__ === 'collection') {
                    collection = collectionOrRef;
                    id = maybeId;
                }
                else {
                    const ref = collectionOrRef;
                    collection = ref.collection;
                    id = ref.id;
                }
                const firebaseDoc = a.firestore.collection(collection.path).doc(id);
                // ^ above
                // TODO: Refactor code above because is all the same as in the regular update function
                t.delete(firebaseDoc);
            }
            return readFunction({ get }).then((data) => writeFunction({ data, set, upset, update, remove }));
        });
    });
}
exports.transaction = transaction;
//# sourceMappingURL=index.js.map