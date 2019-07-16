import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref } from '../ref'

export default async function get<Model>(
  collection: Collection<Model>,
  id: string
): Promise<Doc<Model> | undefined> {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  const firebaseSnap = await firebaseDoc.get()
  const data = firebaseSnap.data() as Model | undefined
  return data ? doc(ref(collection, id), data) : undefined
}
