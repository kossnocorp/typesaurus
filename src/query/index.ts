import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { WhereQuery } from '../where'
import { OrderQuery } from '../order'
import { LimitQuery } from '../limit'

type FirebaseQuery =
  | FirebaseFirestore.CollectionReference
  | FirebaseFirestore.Query

export type Query<Model> = OrderQuery<Model> | WhereQuery<Model> | LimitQuery

export default async function query<Model>(
  collection: Collection<Model>,
  queries: Query<Model>[]
): Promise<Doc<Model>[]> {
  const firebaseQuery = queries.reduce(
    (acc, q) => {
      switch (q.type) {
        case 'order': {
          const { field, method } = q
          return acc.orderBy(field.toString(), method)
        }

        case 'where': {
          const { field, filter, value } = q
          const fieldName = Array.isArray(field) ? field.join('.') : field
          return acc.where(fieldName, filter, value)
        }

        case 'limit': {
          const { number } = q
          return acc.limit(number)
        }
      }
    },
    firestore.collection(collection.path) as FirebaseQuery
  )
  const firebaseSnap = await firebaseQuery.get()
  return firebaseSnap.docs.map(d =>
    doc(ref(collection, d.id), d.data() as Model)
  )
}
