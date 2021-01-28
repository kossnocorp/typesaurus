import { Collection } from '../collection';
import { Doc } from '../doc';
declare type OnResult<Model> = (doc: Doc<Model>[]) => any;
declare type OnError = (error: Error) => any;
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
declare function onGetMany<Model>(collection: Collection<Model>, ids: readonly string[], onResult: OnResult<Model>, onError?: OnError): () => void;
export default onGetMany;
