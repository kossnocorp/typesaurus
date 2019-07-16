import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { unwrapData } from '../data'

export default async function set<Model>(
  collection: Collection<Model>,
  id: string,
  data: Model
): Promise<Doc<Model>> {
  const firestoreDoc = firestore.collection(collection.path).doc(id)
  await firestoreDoc.set(unwrapData(data))
  return doc(ref(collection, id), data)
}
