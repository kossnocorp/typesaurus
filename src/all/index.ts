import { Collection } from '../collection'
import firestore from '../adaptor'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { wrapData } from '../data'

export default async function all<Model>(
  collection: Collection<Model>
): Promise<Doc<Model>[]> {
  const firebaseSnap = await firestore.collection(collection.path).get()
  return firebaseSnap.docs.map(d =>
    doc(ref(collection, d.id), wrapData(d.data()) as Model)
  )
}
