import adaptor from '../adaptor';
import { wrapData } from '../data';
import { doc } from '../doc';
import { ref } from '../ref';
import { environmentError } from '../_lib/assertEnvironment';
/**
 * Subscribes to the given document.
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
export function onGet(collectionOrRef, idOrOnResult, onResultOrOnError, maybeOnErrorOrOptions, maybeOptions) {
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
    let options;
    if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef;
        id = idOrOnResult;
        onResult = onResultOrOnError;
        onError = maybeOnErrorOrOptions;
        options = maybeOptions;
    }
    else {
        const ref = collectionOrRef;
        collection = ref.collection;
        id = ref.id;
        onResult = idOrOnResult;
        onError = onResultOrOnError;
        options = maybeOnErrorOrOptions;
    }
    adaptor().then((a) => {
        const error = environmentError(a, options === null || options === void 0 ? void 0 : options.assertEnvironment);
        if (error) {
            onError === null || onError === void 0 ? void 0 : onError(error);
            return;
        }
        if (unsubCalled)
            return;
        const firestoreDoc = a.firestore.collection(collection.path).doc(id);
        const processResults = (firestoreSnap) => {
            const firestoreData = a.getDocData(firestoreSnap, options);
            const data = firestoreData && wrapData(a, firestoreData);
            onResult((data &&
                doc(ref(collection, id), data, {
                    environment: a.environment,
                    serverTimestamps: options === null || options === void 0 ? void 0 : options.serverTimestamps,
                    ...a.getDocMeta(firestoreSnap)
                })) ||
                null);
        };
        firebaseUnsub =
            a.environment === 'web'
                ? firestoreDoc.onSnapshot(
                // @ts-ignore: In the web environment, the first argument might be options
                { includeMetadataChanges: options === null || options === void 0 ? void 0 : options.includeMetadataChanges }, processResults, 
                // @ts-ignore
                onError)
                : firestoreDoc.onSnapshot(processResults, onError);
    });
    return unsub;
}
//# sourceMappingURL=index.js.map