import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { wrapData } from '../data'

type OnResult<Model> = (doc: Doc<Model> | undefined) => any

function onGet<Model>(ref: Ref<Model>, onResult: OnResult<Model>): () => void

function onGet<Model>(
  collection: Collection<Model>,
  id: string,
  onResult: OnResult<Model>
): () => void

function onGet<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrOnResult: string | OnResult<Model>,
  maybeOnResult?: OnResult<Model>
): () => void {
  let collection: Collection<Model>
  let id: string
  let onResult: OnResult<Model>

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrOnResult as string
    onResult = maybeOnResult as OnResult<Model>
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    onResult = idOrOnResult as OnResult<Model>
  }

  const firestoreDoc = firestore.collection(collection.path).doc(id)
  return firestoreDoc.onSnapshot(firestoreSnap => {
    const firestoreData = firestoreSnap.data()
    const data = firestoreData && (wrapData(firestoreData) as Model)
    onResult(data && doc(ref(collection, id), data))
  })
}

export default onGet
