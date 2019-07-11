import store from '../adaptor'
import { Collection } from '../collection/index'
import { doc, Doc } from '../doc'

export interface Ref<Model> {
  __type__: 'ref'
  collection: Collection<Model>
  id: string
}

export function ref<Model>(
  collection: Collection<Model>,
  id: string
): Ref<Model> {
  return { __type__: 'ref', collection, id }
}

export function getRefPath(ref: Ref<any>) {
  return [ref.collection.path].concat(ref.id).join('/')
}

export function refToFirebaseDocument<Model>(ref: Ref<Model>) {
  return store.doc(getRefPath(ref))
}

export function pathToRef<Model>(path: string): Ref<Model> {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return {
    __type__: 'ref',
    collection: { __type__: 'collection', path: collectionPath },
    id
  }
}

// export async function setRef<Model>(
//   ref: Ref<Model>,
//   data: Model
// ): Promise<Doc<Model>> {
//   const firebaseDocument = refToFirebaseDocument(ref)
//   // return doc.set(unwrapValue(data)).then(() => new Document<Model>(ref, data))
//   return firebaseDocument.set(data).then(() => doc<Model>(ref, data))
// }

// export async function getRef<Model>(
//   ref: Ref<Model>
// ): Promise<Doc<Model> | null> {
//   const doc = refToFirebaseDocument(ref)
//   const snap = await doc.get()
//   const data = snap.data() as Model
//   return createItemOrNull<Model>(ref, data)
// }

// export async function deleteRef<Model>(ref: Ref<Model>): Promise<void> {
//   const doc = refToFirebaseDocument(ref)
//   return doc.delete().then(() => {})
// }

// export function createItemOrNull<Model>(
//   ref: Ref<Model>,
//   data: Model
// ): Doc<Model> | null {
//   return data ? doc<Model>(ref, data) : null
// }
