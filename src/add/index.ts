import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc } from '../doc'
import { ref } from '../ref'
import { unwrapData } from '../data'

export default async function add<Model>(
  collection: Collection<Model>,
  data: Model
) {
  const firebaseDoc = await firestore
    .collection(collection.path)
    .add(unwrapData(data))
  return doc<Model>(ref(collection, firebaseDoc.id), data)
}
