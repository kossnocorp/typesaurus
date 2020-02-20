import { Collection } from '../collection'
import { Doc } from '../doc'
import onGet from '../onGet'

type OnResult<Model> = (doc: Doc<Model>[]) => any

type OnError = (error: Error) => any

/**
 * Subscribes to multiple documents from a collection.
 *
 * ```ts
 * import { onGetMany, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * onGetMany(contacts, [
 *   '07yQrsPK6ENtdEV3eaCE',
 *   '0qasibfFGVOQ4QYqUaQh',
 *   '11FrkclBWXo2BgnSsJNJ',
 * ], fewContacts => {
 *   console.log(fewContacts.length)
 *   //=> 3
 *   console.log(fewContacts[0].ref.id)
 *   //=> '07yQrsPK6ENtdEV3eaCE'
 *   console.log(fewContacts[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @returns Function that unsubscribes the listener from the updates
 */
function onGetMany<Model>(
  collection: Collection<Model>,
  ids: readonly string[],
  onResult: OnResult<Model>,
  onError?: OnError
  // onMissing: ((id: string) => Model) | 'ignore' = id => {
  //   throw new Error(`Missing document with id ${id}`)
  // }
): () => void {
  let waiting = ids.length
  const result = new Array(ids.length)

  const offs = ids.map((id, idIndex) =>
    onGet(
      collection,
      id,
      doc => {
        result[idIndex] = doc
        waiting--
        if (waiting === 0) {
          onResult(result)
        }
      },
      onError
    )
  )

  if (ids.length === 0) onResult([])

  return () => offs.map(off => off())
}

export default onGetMany
