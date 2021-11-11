import type { Collection } from '../collection';
import type { AnyDoc } from '../doc';
import { OnGetOptions } from '../onGet';
import type { RuntimeEnvironment, ServerTimestampsStrategy } from '../types';
declare type OnResult<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy> = (doc: AnyDoc<Model, Environment, boolean, ServerTimestamps>[]) => any;
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
export declare function onGetMany<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy>(collection: Collection<Model>, ids: readonly string[], onResult: OnResult<Model, Environment, ServerTimestamps>, onError?: OnError, options?: OnGetOptions<Environment, ServerTimestamps>): () => void;
export {};
