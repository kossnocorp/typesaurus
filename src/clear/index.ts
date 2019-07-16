import firestore from '../adaptor'
import { Collection } from '../collection'

export default async function clear(collection: Collection<any>, id: string) {
  const firebaseDoc = firestore.collection(collection.path).doc(id)
  await firebaseDoc.delete()
}
