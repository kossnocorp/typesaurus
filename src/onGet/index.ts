import firestore from '../adaptor'
import { Collection } from '../collection'
import { doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import { wrapData } from '../data'

type OnResult<Model> = (doc: Doc<Model> | undefined) => any

type OnError = (error: Error) => any

function onGet<Model>(
  ref: Ref<Model>,
  onResult: OnResult<Model>,
  onError?: OnError
): () => void

function onGet<Model>(
  collection: Collection<Model>,
  id: string,
  onResult: OnResult<Model>,
  onError?: OnError
): () => void

function onGet<Model>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrOnResult: string | OnResult<Model>,
  onResultOrOnError?: OnResult<Model> | OnError,
  maybeOnError?: OnError
): () => void {
  let collection: Collection<Model>
  let id: string
  let onResult: OnResult<Model>
  let onError: OnError | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrOnResult as string
    onResult = onResultOrOnError as OnResult<Model>
    onError = maybeOnError
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    onResult = idOrOnResult as OnResult<Model>
    onError = onResultOrOnError as OnError | undefined
  }

  const firestoreDoc = firestore.collection(collection.path).doc(id)
  return firestoreDoc.onSnapshot(firestoreSnap => {
    const firestoreData = firestoreSnap.data()
    const data = firestoreData && (wrapData(firestoreData) as Model)
    onResult(data && doc(ref(collection, id), data))
  }, onError)
}

export default onGet
