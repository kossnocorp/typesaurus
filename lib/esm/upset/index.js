import adaptor from '../adaptor';
import { unwrapData } from '../data';
import { assertEnvironment } from '../_lib/assertEnvironment';
/**
 * Sets a document to the given data or updates if it exists.
 *
 * ```ts
 * import { upset, update, get, collection } from 'typesaurus'
 *
 * type User = { name: string, deleted?: boolean }
 * const users = collection<User>('users')
 *
 * const userId = '00sHm46UWKObv2W7XK9e'
 * await upset(users, userId, { name: 'Sasha' })
 * await update(users, userId, { deleted: true })
 * await upset(users, userId, { name: 'Sasha Koss' })
 * console.log(await get(users, userId))
 * //=> { name: 'Sasha Koss', deleted: true }
 * ```
 */
export async function upset(collectionOrRef, idOrData, maybeDataOrOptions, maybeOptions) {
    const a = await adaptor();
    let collection;
    let id;
    let data;
    let options;
    if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef;
        id = idOrData;
        data = maybeDataOrOptions;
        options = maybeOptions;
    }
    else {
        const ref = collectionOrRef;
        collection = ref.collection;
        id = ref.id;
        data = idOrData;
        options = maybeDataOrOptions;
    }
    assertEnvironment(a, options === null || options === void 0 ? void 0 : options.assertEnvironment);
    const firestoreDoc = a.firestore.collection(collection.path).doc(id);
    await firestoreDoc.set(unwrapData(a, data), { merge: true });
}
//# sourceMappingURL=index.js.map