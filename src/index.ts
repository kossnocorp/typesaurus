import firestore, {
  FirestoreWhereFilterOp,
  FirestoreOrderByDirection
} from './adaptor'
import { Collection } from './collection'
import { doc, Doc } from './doc'
import { ref, Ref } from './ref'
import { Value } from './data'
import where, { WhereQuery } from './store/where'

const store = { get, set, add, update, clear, query, where, order, limit }
export default store

export type ModelUpdate<Model> = {
  [Key in keyof Model]?: Model[Key] | Value<Model[Key]>
}

export interface OrderQuery<Model> {
  type: 'order'
  field: keyof Model
  method: FirestoreOrderByDirection
}

export interface LimitQuery {
  type: 'limit'
  number: number
}

export type Query<Model> = OrderQuery<Model> | WhereQuery<Model> | LimitQuery

async function get<Model>(
  collection: Collection<Model>,
  id: string
): Promise<Doc<Model> | undefined> {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  const firebaseSnap = await firebaseDoc.get()
  const data = firebaseSnap.data() as Model | undefined
  return data ? doc(ref(collection, id), data) : undefined
}

async function set<Model>(
  collection: Collection<Model>,
  id: string,
  data: Model
): Promise<Doc<Model>> {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  await firebaseDoc.set(data)
  return doc(ref(collection, id), data)
}

async function add<Model>(collection: Collection<Model>, data: Model) {
  const firebaseDoc = await firestore.collection(collection.path).add(data)
  return doc<Model>(ref(collection, firebaseDoc.id), data)
}

async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: ModelUpdate<Model>
) {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  await firebaseDoc.update(data)
}

async function clear(collection: Collection<any>, id: string) {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  await firebaseDoc.delete()
}

type FirebaseQuery =
  | FirebaseFirestore.CollectionReference
  | FirebaseFirestore.Query

async function query<Model>(
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

function order<Model>(
  field: keyof Model,
  method: FirestoreOrderByDirection
): OrderQuery<Model> {
  return {
    type: 'order',
    field,
    method
  }
}

function limit(number: number): LimitQuery {
  return {
    type: 'limit',
    number
  }
}
