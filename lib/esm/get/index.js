import adaptor from '../adaptor';
import { wrapData } from '../data';
import { doc } from '../doc';
import { ref } from '../ref';
import { assertEnvironment } from '../_lib/assertEnvironment';
/**
 * Retrieves a document from a collection.
 *
 * ```ts
 * import { get, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * get(users, '00sHm46UWKObv2W7XK9e').then(user => {
 *   console.log(user)
 *   //=> { __type__: 'doc', data: { name: 'Sasha' }, ... }
 * })
 * // Or using ref:
 * get(currentUser.ref)
 * ```
 *
 * @returns Promise to the document or null if not found
 */
export async function get(collectionOrRef, maybeIdOrOptions, maybeOptions) {
    const a = await adaptor();
    return getCommon(collectionOrRef, maybeIdOrOptions, maybeOptions, { a, t: undefined });
}
export async function getCommon(collectionOrRef, maybeIdOrOptions, maybeOptions, { a, t }) {
    let collection;
    let id;
    let options;
    if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef;
        id = maybeIdOrOptions;
        options = maybeOptions;
    }
    else {
        const ref = collectionOrRef;
        collection = ref.collection;
        id = ref.id;
        options = maybeIdOrOptions;
    }
    if (!t)
        assertEnvironment(a, options === null || options === void 0 ? void 0 : options.assertEnvironment);
    const firestoreDoc = a.firestore.collection(collection.path).doc(id);
    const firestoreSnap = await (t ? t.get(firestoreDoc) : firestoreDoc.get());
    const firestoreData = a.getDocData(firestoreSnap, options);
    const data = firestoreData && wrapData(a, firestoreData);
    return data
        ? doc(ref(collection, id), data, {
            environment: a.environment,
            serverTimestamps: options === null || options === void 0 ? void 0 : options.serverTimestamps,
            ...a.getDocMeta(firestoreSnap)
        })
        : null;
}
//# sourceMappingURL=index.js.map