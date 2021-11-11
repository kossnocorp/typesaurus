import adaptor from '../adaptor';
import { wrapData } from '../data';
import { doc } from '../doc';
import { pathToRef, ref } from '../ref';
import { assertEnvironment } from '../_lib/assertEnvironment';
/**
 * Returns all documents in a collection.
 *
 * ```ts
 * import { all, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * all(users).then(allUsers => {
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
 * @returns A promise to all documents
 */
export async function all(collection, options) {
    const a = await adaptor();
    assertEnvironment(a, options === null || options === void 0 ? void 0 : options.assertEnvironment);
    const firestoreQuery = collection.__type__ === 'collectionGroup'
        ? a.firestore.collectionGroup(collection.path)
        : a.firestore.collection(collection.path);
    const firebaseSnap = await firestoreQuery.get();
    return firebaseSnap.docs.map((snap) => doc(collection.__type__ === 'collectionGroup'
        ? pathToRef(snap.ref.path)
        : ref(collection, snap.id), wrapData(a, a.getDocData(snap, options)), {
        environment: a.environment,
        serverTimestamps: options === null || options === void 0 ? void 0 : options.serverTimestamps,
        ...a.getDocMeta(snap)
    }));
}
//# sourceMappingURL=index.js.map