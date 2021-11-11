import { getCommon, queryCommon } from '..';
import adaptor from '../adaptor';
import { unwrapData } from '../data';
import { assertEnvironment } from '../_lib/assertEnvironment';
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
export async function transaction(readFunction, writeFunction, options) {
    const a = await adaptor();
    assertEnvironment(a, options === null || options === void 0 ? void 0 : options.assertEnvironment);
    return a.firestore.runTransaction((t) => {
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
            t.set(firestoreDoc, unwrapData(a, data));
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
            t.set(firestoreDoc, unwrapData(a, data), { merge: true });
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
            t.update(firebaseDoc, unwrapData(a, updateData));
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
        return readFunction({
            get: (...props) => getCommon(...props, { a, t }),
            query: (...props) => queryCommon(...props, { a, t })
        }).then((data) => writeFunction({ data, set, upset, update, remove }));
    });
}
//# sourceMappingURL=index.js.map