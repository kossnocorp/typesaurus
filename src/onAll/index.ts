import { Collection } from '../collection'
import firestore from '../adaptor'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { wrapData } from '../data'

export default function onAll<Model>(
  collection: Collection<Model>,
  onResult: (docs: Doc<Model>[]) => any,
  onError?: (error: Error) => any
): () => void {
  return firestore()
    .collection(collection.path)
    .onSnapshot(firebaseSnap => {
      const docs = firebaseSnap.docs.map(d =>
        doc(ref(collection, d.id), wrapData(d.data()) as Model)
      )
      onResult(docs)
    }, onError)
}
