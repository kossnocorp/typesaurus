import adaptor from '../adaptor';
/**
 * Removes a document.
 *
 * ```ts
 * import { remove } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * remove(users, '00sHm46UWKObv2W7XK9e').then(() => console.log('Done!'))
 * ```
 *
 * @returns A promise that resolves when the operation is complete
 */
export async function remove(collectionOrRef, maybeId) {
    const a = await adaptor();
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
    await firebaseDoc.delete();
}
//# sourceMappingURL=index.js.map