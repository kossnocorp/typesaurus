"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adaptor_1 = __importDefault(require("../adaptor"));
const data_1 = require("../data");
const doc_1 = require("../doc");
const docId_1 = require("../docId");
const ref_1 = require("../ref");
/**
 * Subscribes to a collection query built using query objects ({@link order | order}, {@link where | where}, {@link limit | limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * onQuery(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ], bornAfter2000 => {
 *   console.log(bornAfter2000)
 *   //=> 420
 *   console.log(bornAfter2000[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(bornAfter2000[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection or collection group to query
 * @param queries - The query objects
 * @param onResult - The function which is called with the query result when
 * the initial fetch is resolved or the query result updates.
 * @param onError - The function is called with error when request fails.
 * @returns Function that unsubscribes the listener from the updates
 */
function onQuery(collection, queries, onResult, onError) {
    let unsubCalled = false;
    let firebaseUnsub;
    const unsub = () => {
        unsubCalled = true;
        firebaseUnsub && firebaseUnsub();
    };
    adaptor_1.default()
        .then((a) => {
        if (unsubCalled)
            return;
        const { firestoreQuery, cursors } = queries.reduce((acc, q) => {
            switch (q.type) {
                case 'order': {
                    const { field, method, cursors } = q;
                    acc.firestoreQuery = acc.firestoreQuery.orderBy(field instanceof docId_1.DocId
                        ? a.consts.FieldPath.documentId()
                        : field.toString(), method);
                    if (cursors)
                        acc.cursors = acc.cursors.concat(cursors.map(({ method, value }) => ({
                            method,
                            value: typeof value === 'object' &&
                                value !== null &&
                                '__type__' in value &&
                                value.__type__ === 'doc'
                                ? field instanceof docId_1.DocId
                                    ? value.ref.id
                                    : value.data[field]
                                : value
                        })));
                    break;
                }
                case 'where': {
                    const { field, filter, value } = q;
                    const fieldName = Array.isArray(field) ? field.join('.') : field;
                    acc.firestoreQuery = acc.firestoreQuery.where(fieldName instanceof docId_1.DocId
                        ? a.consts.FieldPath.documentId()
                        : fieldName, filter, data_1.unwrapData(a, value));
                    break;
                }
                case 'limit': {
                    const { number } = q;
                    acc.firestoreQuery = acc.firestoreQuery.limit(number);
                    break;
                }
            }
            return acc;
        }, {
            firestoreQuery: collection.__type__ === 'collectionGroup'
                ? a.firestore.collectionGroup(collection.path)
                : a.firestore.collection(collection.path),
            cursors: []
        });
        const groupedCursors = cursors.reduce((acc, cursor) => {
            let methodValues = acc.find(([method]) => method === cursor.method);
            if (!methodValues) {
                methodValues = [cursor.method, []];
                acc.push(methodValues);
            }
            methodValues[1].push(data_1.unwrapData(a, cursor.value));
            return acc;
        }, []);
        const paginatedFirestoreQuery = cursors.length && cursors.every((cursor) => cursor.value !== undefined)
            ? groupedCursors.reduce((acc, [method, values]) => {
                return acc[method](...values);
            }, firestoreQuery)
            : firestoreQuery;
        firebaseUnsub = paginatedFirestoreQuery.onSnapshot((firestoreSnap) => {
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
    })
        .catch(onError);
    return unsub;
}
exports.default = onQuery;
//# sourceMappingURL=index.js.map