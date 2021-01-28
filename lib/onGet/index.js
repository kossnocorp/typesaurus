"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adaptor_1 = __importDefault(require("../adaptor"));
const data_1 = require("../data");
const doc_1 = require("../doc");
const ref_1 = require("../ref");
/**
 * Subscribes to the diven document.
 *
 * ```ts
 * import { onGet, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * onGet(users, '00sHm46UWKObv2W7XK9e', sasha => {
 *   console.log(sasha.ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(sasha.data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @returns Function that unsubscribes the listener from the updates
 */
function onGet(collectionOrRef, idOrOnResult, onResultOrOnError, maybeOnError) {
    let unsubCalled = false;
    let firebaseUnsub;
    const unsub = () => {
        unsubCalled = true;
        firebaseUnsub && firebaseUnsub();
    };
    let collection;
    let id;
    let onResult;
    let onError;
    if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef;
        id = idOrOnResult;
        onResult = onResultOrOnError;
        onError = maybeOnError;
    }
    else {
        const ref = collectionOrRef;
        collection = ref.collection;
        id = ref.id;
        onResult = idOrOnResult;
        onError = onResultOrOnError;
    }
    adaptor_1.default().then((a) => {
        if (unsubCalled)
            return;
        const firestoreDoc = a.firestore.collection(collection.path).doc(id);
        firebaseUnsub = firestoreDoc.onSnapshot((snap) => {
            const firestoreData = snap.data();
            const data = firestoreData && data_1.wrapData(a, firestoreData);
            onResult((data && doc_1.doc(ref_1.ref(collection, id), data, a.getDocMeta(snap))) || null);
        }, onError);
    });
    return unsub;
}
exports.default = onGet;
//# sourceMappingURL=index.js.map