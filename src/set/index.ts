import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { unwrapData } from '../data'

async function set<Model>(ref: Ref<Model>, data: Model): Promise<Doc<Model>>

async function set<Model>(
  collection: Collection<Model>,
  id: string,
  data: Model
): Promise<Doc<Model>>

async function set<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | Model,
  maybeData?: Model
): Promise<Doc<Model>> {
  let collection: Collection<Model>
  let id: string
  let data: Model

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeData as Model
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as Model
  }

  const firestoreDoc = firestore()
    .collection(collection.path)
    .doc(id)
  await firestoreDoc.set(unwrapData(data))
  return doc(ref(collection, id), data)
}

export default set
