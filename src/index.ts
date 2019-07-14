import firestore from './adaptor'
import { Collection } from './collection'
import { doc, Doc } from './doc'
import { ref } from './ref'
import where from './where'
import order from './order'
import update from './update'
import limit from './limit'
import query from './query'

const store = { get, set, add, update, clear, query, where, order, limit }
export default store

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

async function clear(collection: Collection<any>, id: string) {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  await firebaseDoc.delete()
}
