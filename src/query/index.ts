import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, pathToRef } from '../ref'
import { WhereQuery } from '../where'
import { OrderQuery } from '../order'
import { LimitQuery } from '../limit'
import { Cursor, CursorMethod } from '../cursor'
import { wrapData, unwrapData } from '../data'
import { CollectionGroup } from '../group'

type FirebaseQuery =
  | FirebaseFirestore.CollectionReference
  | FirebaseFirestore.Query

// TODO: Refactor with onQuery

/**
 * The query type.
 */
export type Query<Model, Key extends keyof Model> =
  | OrderQuery<Model, Key>
  | WhereQuery<Model>
  | LimitQuery

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
export async function query<Model>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[]
): Promise<Doc<Model>[]> {
  const { firestoreQuery, cursors } = queries.reduce(
    (acc, q) => {
      switch (q.type) {
        case 'order': {
          const { field, method, cursors } = q
          acc.firestoreQuery = acc.firestoreQuery.orderBy(
            field.toString(),
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
                    ? value.data[field]
                    : value
              }))
            )
          break
        }

        case 'where': {
          const { field, filter, value } = q
          const fieldName = Array.isArray(field) ? field.join('.') : field
          acc.firestoreQuery = acc.firestoreQuery.where(
            fieldName,
            filter,
            unwrapData(value)
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
          ? firestore().collectionGroup(collection.path)
          : firestore().collection(collection.path),
      cursors: []
    } as {
      firestoreQuery: FirebaseQuery
      cursors: Cursor<Model, keyof Model>[]
    }
  )

  const groupedCursors = cursors.reduce(
    (acc, cursor) => {
      let methodValues = acc.find(([method]) => method === cursor.method)
      if (!methodValues) {
        methodValues = [cursor.method, []]
        acc.push(methodValues)
      }
      methodValues[1].push(unwrapData(cursor.value))
      return acc
    },
    [] as [CursorMethod, any[]][]
  )

  const paginatedFirestoreQuery =
    cursors.length && cursors.every(cursor => cursor.value !== undefined)
      ? groupedCursors.reduce((acc, [method, values]) => {
          return acc[method](...values)
        }, firestoreQuery)
      : firestoreQuery

  const firebaseSnap = await paginatedFirestoreQuery.get()

  return firebaseSnap.docs.map(d =>
    doc(
      collection.__type__ === 'collectionGroup'
        ? pathToRef(d.ref.path)
        : ref(collection, d.id),
      wrapData(d.data()) as Model
    )
  )
}
