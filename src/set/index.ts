import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref } from '../ref'

export default async function set<Model>(
  collection: Collection<Model>,
  id: string,
  data: Model
): Promise<Doc<Model>> {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  await firebaseDoc.set(data)
  return doc(ref(collection, id), data)
}
