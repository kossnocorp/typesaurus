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
 * Subscribes to all documents in a collection.
 *
 * ```ts
 * import { onAll, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * onAll(users, allUsers => {
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
 * @param onResult - The function which is called with all documents array when
 * the initial fetch is resolved or the collection updates.
 * @param onError - The function is called with error when request fails.
 */
function onAll(collection, onResult, onError) {
    let unsubCalled = false;
    let firebaseUnsub;
    const unsub = () => {
        unsubCalled = true;
        firebaseUnsub && firebaseUnsub();
    };
    adaptor_1.default().then((a) => {
        if (unsubCalled)
            return;
        firebaseUnsub = (collection.__type__ === 'collectionGroup'
            ? a.firestore.collectionGroup(collection.path)
            : a.firestore.collection(collection.path)).onSnapshot((firestoreSnap) => {
            const docs = firestoreSnap.docs.map((snap) => doc_1.doc(collection.__type__ === 'collectionGroup'
                ? ref_1.pathToRef(snap.ref.path)
                : ref_1.ref(collection, snap.id), data_1.wrapData(a, snap.data()), a.getDocMeta(snap)));
            const changes = () => firestoreSnap.docChanges().map((change) => ({
                type: change.type,
                oldIndex: change.oldIndex,
                newIndex: change.newIndex,
                doc: docs[change.type === 'removed' ? change.oldIndex : change.newIndex] ||
                    // If change.type indicates 'removed', sometimes(not all the time) `docs` does not
                    // contain the removed document. In that case, we'll restore it from `change.doc`:
                    doc_1.doc(collection.__type__ === 'collectionGroup'
                        ? ref_1.pathToRef(change.doc.ref.path)
                        : ref_1.ref(collection, change.doc.id), data_1.wrapData(a, change.doc.data()), a.getDocMeta(change.doc))
            }));
            onResult(docs, {
                changes,
                size: firestoreSnap.size,
                empty: firestoreSnap.empty
            });
        }, onError);
    });
    return unsub;
}
exports.default = onAll;
//# sourceMappingURL=index.js.map