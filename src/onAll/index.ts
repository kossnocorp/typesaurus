import { Collection } from '../collection'
import adaptor from '../adaptor'
import { doc, Doc } from '../doc'
import { ref } from '../ref'
import { wrapData } from '../data'

/**
 * Subscribes to all documents in a collection.
 *
 * ```ts
 * import { onAll, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * onAll(users, allUsers => {
 *   console.log(allUsers.length)
 *   //=> 420
 *   console.log(allUsers[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(allUsers[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection to get all documents from
 * @param onResult - The function which is called with all documents array when
 * the initial fetch is resolved or the collection updates.
 * @param onError - The function is called with error when request fails.
 */
export default function onAll<Model>(
  collection: Collection<Model>,
  onResult: (docs: Doc<Model>[]) => any,
  onError?: (error: Error) => any
): () => void {
  let unsubCalled = false
  let firebaseUnsub: () => void
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }

  adaptor().then(a => {
    if (unsubCalled) return
    firebaseUnsub = a.firestore
      .collection(collection.path)
      .onSnapshot(firebaseSnap => {
        const docs = firebaseSnap.docs.map(d =>
          doc(ref(collection, d.id), wrapData(a, d.data()) as Model)
        )
        onResult(docs)
      }, onError)
  })

  return unsub
}
