import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { wrapData } from '../data'

async function get<Model>(ref: Ref<Model>): Promise<Doc<Model> | undefined>

async function get<Model>(
  collection: Collection<Model>,
  id: string
): Promise<Doc<Model> | undefined>

async function get<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeId?: string
): Promise<Doc<Model> | undefined> {
  let collection: Collection<Model>
  let id: string

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeId as string
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
  }

  const firestoreDoc = firestore.collection(collection.path).doc(id)
  const firestoreSnap = await firestoreDoc.get()
  const firestoreData = firestoreSnap.data()
  const data = firestoreData && (wrapData(firestoreData) as Model)
  return data ? doc(ref(collection, id), data) : undefined
}

export default get
