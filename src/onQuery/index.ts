import adaptor from '../adaptor'
import { Collection } from '../collection'
import { Cursor, CursorMethod } from '../cursor'
import { unwrapData, wrapData } from '../data'
import { doc, Doc } from '../doc'
import { DocId } from '../docId'
import { CollectionGroup } from '../group'
import { LimitQuery } from '../limit'
import { OrderQuery } from '../order'
import { pathToRef, ref } from '../ref'
import { WhereQuery } from '../where'
import { SnapshotInfo } from '../snapshot'

type FirebaseQuery =
  | FirebaseFirestore.CollectionReference
  | FirebaseFirestore.Query

// TODO: Refactor with query

/**
 * The query type.
 */
export type Query<Model, Key extends keyof Model> =
  | OrderQuery<Model, Key>
  | WhereQuery<Model>
  | LimitQuery

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
export default function onQuery<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[],
  onResult: (docs: Doc<Model>[], info: SnapshotInfo<Model>) => any,
  onError?: (err: Error) => any
): () => void {
  let unsubCalled = false
  let firebaseUnsub: () => void
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }

  adaptor()
    .then((a) => {
      if (unsubCalled) return

      const { firestoreQuery, cursors } = queries.reduce(
        (acc, q) => {
          switch (q.type) {
            case 'order': {
              const { field, method, cursors } = q
              acc.firestoreQuery = acc.firestoreQuery.orderBy(
                field instanceof DocId
                  ? a.consts.FieldPath.documentId()
                  : field.toString(),
                method
              )
              if (cursors)
                acc.cursors = acc.cursors.concat(
                  cursors.map(({ method, value }) => ({
                    method,
                    value:
                      typeof value === 'object' &&
                      value !== null &&
                      '__type__' in value &&
                      value.__type__ === 'doc'
                        ? field instanceof DocId
                          ? value.ref.id
                          : value.data[field]
                        : value
                  }))
                )
              break
            }

            case 'where': {
              const { field, filter, value } = q
              const fieldName = Array.isArray(field) ? field.join('.') : field
              acc.firestoreQuery = acc.firestoreQuery.where(
                fieldName instanceof DocId
                  ? a.consts.FieldPath.documentId()
                  : fieldName,
                filter,
                unwrapData(a, value)
              )
              break
            }

            case 'limit': {
              const { number } = q
              acc.firestoreQuery = acc.firestoreQuery.limit(number)
              break
            }
          }

          return acc
        },
        {
          firestoreQuery:
            collection.__type__ === 'collectionGroup'
              ? a.firestore.collectionGroup(collection.path)
              : a.firestore.collection(collection.path),
          cursors: []
        } as {
          firestoreQuery: FirebaseQuery
          cursors: Cursor<Model, keyof Model>[]
        }
      )

      const groupedCursors = cursors.reduce((acc, cursor) => {
        let methodValues = acc.find(([method]) => method === cursor.method)
        if (!methodValues) {
          methodValues = [cursor.method, []]
          acc.push(methodValues)
        }
        methodValues[1].push(unwrapData(a, cursor.value))
        return acc
      }, [] as [CursorMethod, any[]][])

      const paginatedFirestoreQuery =
        cursors.length && cursors.every((cursor) => cursor.value !== undefined)
          ? groupedCursors.reduce((acc, [method, values]) => {
              return acc[method](...values)
            }, firestoreQuery)
          : firestoreQuery

      firebaseUnsub = paginatedFirestoreQuery.onSnapshot(
        (firestoreSnap: FirebaseFirestore.QuerySnapshot) => {
          const docs = firestoreSnap.docs.map((snap) =>
            doc(
              collection.__type__ === 'collectionGroup'
                ? pathToRef(snap.ref.path)
                : ref(collection, snap.id),
              wrapData(a, snap.data()) as Model,
              a.getDocMeta(snap)
            )
          )

          const changes = () =>
            firestoreSnap.docChanges().map((change) => ({
              type: change.type,
              oldIndex: change.oldIndex,
              newIndex: change.newIndex,
              doc:
                docs[
                  change.type === 'removed' ? change.oldIndex : change.newIndex
                ] ||
                // If change.type indicates 'removed', sometimes(not all the time) `docs` does not
                // contain the removed document. In that case, we'll restore it from `change.doc`:
                doc(
                  collection.__type__ === 'collectionGroup'
                    ? pathToRef(change.doc.ref.path)
                    : ref(collection, change.doc.id),
                  wrapData(a, change.doc.data()) as Model,
                  a.getDocMeta(change.doc)
                )
            }))
          onResult(docs, {
            changes,
            size: firestoreSnap.size,
            empty: firestoreSnap.empty
          })
        },
        onError
      )
    })
    .catch(onError)

  return unsub
}
