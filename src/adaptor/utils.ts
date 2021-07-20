import { FirestoreDocumentReference } from '.'

export function getAll(...docs: FirestoreDocumentReference[]) {
  return Promise.all(docs.map((doc) => doc.get()))
}
