import adaptor from '../adaptor';
import { unwrapData, wrapData } from '../data';
import { doc } from '../doc';
import { DocId } from '../docId';
import { pathToRef, ref } from '../ref';
import { assertEnvironment } from '../_lib/assertEnvironment';
/**
 * Queries passed collection using query objects ({@link order}, {@link where}, {@link limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ]).then(bornAfter2000 => {
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
 * @returns The promise to the query results
 */
export async function query(collection, queries, options) {
    const a = await adaptor();
    return queryCommon(collection, queries, options, { a, t: undefined });
}
export async function queryCommon(collection, queries, options, { a, t }) {
    if (!t)
        assertEnvironment(a, options === null || options === void 0 ? void 0 : options.assertEnvironment);
    const { firestoreQuery, cursors } = queries.reduce((acc, q) => {
        switch (q.type) {
            case 'order': {
                const { field, method, cursors } = q;
                acc.firestoreQuery = acc.firestoreQuery.orderBy(field instanceof DocId
                    ? a.consts.FieldPath.documentId()
                    : field.toString(), method);
                if (cursors)
                    acc.cursors = acc.cursors.concat(
                    // @ts-ignore
                    cursors.map(({ method, value }) => ({
                        method,
                        value: typeof value === 'object' &&
                            value !== null &&
                            '__type__' in value &&
                            value.__type__ == 'doc'
                            ? field instanceof DocId
                                ? value.ref.id
                                : value.data[field]
                            : value
                    })));
                break;
            }
            case 'where': {
                const { field, filter, value } = q;
                const fieldName = Array.isArray(field) ? field.join('.') : field;
                acc.firestoreQuery = acc.firestoreQuery.where(fieldName instanceof DocId
                    ? a.consts.FieldPath.documentId()
                    : fieldName, filter, unwrapData(a, value));
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
        methodValues[1].push(unwrapData(a, cursor.value));
        return acc;
    }, []);
    const paginatedFirestoreQuery = cursors.length && cursors.every((cursor) => cursor.value !== undefined)
        ? groupedCursors.reduce((acc, [method, values]) => {
            return acc[method](...values);
        }, firestoreQuery)
        : firestoreQuery;
    const firebaseSnap = await (t ? t.get(paginatedFirestoreQuery) : paginatedFirestoreQuery.get());
    return firebaseSnap.docs.map((snap) => doc(collection.__type__ === 'collectionGroup'
        ? pathToRef(snap.ref.path)
        : ref(collection, snap.id), wrapData(a, a.getDocData(snap, options)), {
        environment: a.environment,
        serverTimestamps: options === null || options === void 0 ? void 0 : options.serverTimestamps,
        ...a.getDocMeta(snap)
    }));
}
//# sourceMappingURL=index.js.map