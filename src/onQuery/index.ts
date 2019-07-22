import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { WhereQuery } from '../where'
import { OrderQuery } from '../order'
import { LimitQuery } from '../limit'
import { Cursor, CursorMethod } from '../cursor'
import { wrapData, unwrapData } from '../data'

type FirebaseQuery =
  | FirebaseFirestore.CollectionReference
  | FirebaseFirestore.Query

export type Query<Model, Key extends keyof Model> =
  | OrderQuery<Model, Key>
  | WhereQuery<Model>
  | LimitQuery

export default function onQuery<Model>(
  collection: Collection<Model>,
  queries: Query<Model, keyof Model>[],
  onResult: (docs: Doc<Model>[]) => any,
  onError?: (err: Error) => any
): () => void {
  const { firestoreQuery, cursors } = queries.reduce(
    (acc, q) => {
      switch (q.type) {
        case 'order': {
          const { field, method, cursors } = q
          acc.firestoreQuery = acc.firestoreQuery.orderBy(
            field.toString(),
            method
          )
          if (cursors) acc.cursors = acc.cursors.concat(cursors)
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
    { firestoreQuery: firestore.collection(collection.path), cursors: [] } as {
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

  return paginatedFirestoreQuery.onSnapshot(firestoreSnap => {
    onResult(
      firestoreSnap.docs.map(d =>
        doc(ref(collection, d.id), wrapData(d.data()) as Model)
      )
    )
  }, onError)
}
