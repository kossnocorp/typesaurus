import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, pathToRef } from '../ref'
import { WhereQuery } from '../where'
import { OrderQuery } from '../order'
import { LimitQuery } from '../limit'
import { Cursor, CursorMethod } from '../cursor'
import { wrapData, unwrapData } from '../data'
import { CollectionGroup } from '../group/index'

type FirebaseQuery =
  | FirebaseFirestore.CollectionReference
  | FirebaseFirestore.Query

export type Query<Model, Key extends keyof Model> =
  | OrderQuery<Model, Key>
  | WhereQuery<Model>
  | LimitQuery

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
    {
      firestoreQuery:
        collection.__type__ === 'collectionGroup'
          ? firestore.collectionGroup(collection.path)
          : firestore.collection(collection.path),
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
