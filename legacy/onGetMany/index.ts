import adaptor from '../adaptor'
import type { Collection } from '../collection'
import type { AnyDoc } from '../doc'
import { onGet, OnGetOptions } from '../onGet'
import type { RuntimeEnvironment, ServerTimestampsStrategy } from '../types'
import { environmentError } from '../_lib/assertEnvironment'

type OnResult<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> = (doc: AnyDoc<Model, Environment, boolean, ServerTimestamps>[]) => any

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
export function onGetMany<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  ids: readonly string[],
  onResult: OnResult<Model, Environment, ServerTimestamps>,
  onError?: OnError,
  // onMissing: ((id: string) => Model) | 'ignore' = id => {
  //   throw new Error(`Missing document with id ${id}`)
  // }
  options?: OnGetOptions<Environment, ServerTimestamps>
): () => void {
  let unsubCalled = false
  let firebaseUnsub: () => void
  const unsub = () => {
    unsubCalled = true
    firebaseUnsub && firebaseUnsub()
  }
  let waiting = ids.length
  const result = new Array(ids.length)

  adaptor().then((a) => {
    if (unsubCalled) return

    const error = environmentError(a, options?.assertEnvironment)
    if (error) {
      onError?.(error)
      return
    }

    if (ids.length === 0) {
      onResult([])
      return
    }

    const offs = ids.map((id, idIndex) =>
      onGet(
        collection,
        id,
        (doc) => {
          result[idIndex] = doc
          if (waiting) waiting--
          if (waiting === 0) {
            onResult(result)
          }
        },
        onError,
        options
      )
    )

    firebaseUnsub = () => offs.map((off) => off())
  })

  return unsub
}
