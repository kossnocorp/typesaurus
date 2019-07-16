import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { wrapData } from '../data'

export default async function get<Model>(
  collection: Collection<Model>,
  id: string
): Promise<Doc<Model> | undefined> {
  const firestoreDoc = firestore.collection(collection.path).doc(id)
  const firestoreSnap = await firestoreDoc.get()
  const firestoreData = firestoreSnap.data()
  const data = firestoreData && (wrapData(firestoreData) as Model)
  return data ? doc(ref(collection, id), data) : undefined
}
