import adaptor from '../adaptor';
import { unwrapData } from '../data';
import { assertEnvironment } from '../_lib/assertEnvironment';
/**
 * Creates {@link Batch|batch API} with a set of functions ({@link Batch.set|set},
 * {@link Batch.upset|upset}, {@link Batch.update|update}, {@link Batch.remove|remove})
 * that are similar to regular set, update and remove with the only difference
 * that the batch counterparts do not return a promise and perform operations
 * only when {@link Batch.commit|commit} function is called.
 *
 * ```ts
 * import { batch, collection } from 'typesaurus'
 *
 * type Counter = { count: number }
 * const counters = collection<Counter>('counters')
 *
 * const { set, update, remove, commit } = batch()
 *
 * for (let count = 0; count < 500; count++) {
 *   // Each batch can be up to 500 set, update and remove operations
 *   set(counters, count.toString(), { count })
 * }
 *
 * // Set 500 documents
 * commit().then(() => console.log('Done!'))
 * ```
 *
 * @returns The batch API object.
 */
export function batch(options) {
    const commands = [];
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
        commands.push((adaptor, firestoreBatch) => {
            const firestoreDoc = adaptor.firestore.collection(collection.path).doc(id);
            // ^ above
            // TODO: Refactor code above and below because is all the same as in the regular set function
            firestoreBatch.set(firestoreDoc, unwrapData(adaptor, data));
        });
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
        commands.push((adaptor, firestoreBatch) => {
            const firestoreDoc = adaptor.firestore.collection(collection.path).doc(id);
            // ^ above
            // TODO: Refactor code above and below because is all the same as in the regular set function
            firestoreBatch.set(firestoreDoc, unwrapData(adaptor, data), {
                merge: true
            });
        });
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
        commands.push((adaptor, firestoreBatch) => {
            const firebaseDoc = adaptor.firestore.collection(collection.path).doc(id);
            const updateData = Array.isArray(data)
                ? data.reduce((acc, { key, value }) => {
                    acc[Array.isArray(key) ? key.join('.') : key] = value;
                    return acc;
                }, {})
                : data;
            // ^ above
            // TODO: Refactor code above because is all the same as in the regular update function
            firestoreBatch.update(firebaseDoc, unwrapData(adaptor, updateData));
        });
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
        commands.push((adaptor, firestoreBatch) => {
            const firebaseDoc = adaptor.firestore.collection(collection.path).doc(id);
            // ^ above
            // TODO: Refactor code above because is all the same as in the regular remove function
            firestoreBatch.delete(firebaseDoc);
        });
    }
    async function commit() {
        const a = await adaptor();
        assertEnvironment(a, options === null || options === void 0 ? void 0 : options.assertEnvironment);
        const b = a.firestore.batch();
        commands.forEach((fn) => fn(a, b));
        await b.commit();
    }
    return { set, upset, update, remove, commit };
}
//# sourceMappingURL=index.js.map