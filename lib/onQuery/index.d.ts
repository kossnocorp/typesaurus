import type { Collection } from '../collection'
import { AnyDoc } from '../doc'
import type { CollectionGroup } from '../group'
import type { SnapshotInfo } from '../snapshot'
import type {
  DocOptions,
  OperationOptions,
  Query,
  RealtimeOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy
} from '../types'
export declare type OnQueryOptions<
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> = DocOptions<ServerTimestamps> &
  OperationOptions<Environment> &
  RealtimeOptions
declare type OnResult<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> = (
  docs: AnyDoc<Model, Environment, boolean, ServerTimestamps>[],
  info: SnapshotInfo<Model>
) => any
declare type OnError = (error: Error) => any
/**
 * Subscribes to a collection query built using query objects ({@link order | order}, {@link where | where}, {@link limit | limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * onQuery(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ], bornAfter2000 => {
 *   console.log(bornAfter2000)
 *   //=> 420
 *   console.log(bornAfter2000[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(bornAfter2000[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection or collection group to query
 * @param queries - The query objects
 * @param onResult - The function which is called with the query result when
 * the initial fetch is resolved or the query result updates.
 * @param onError - The function is called with error when request fails.
 * @returns Function that unsubscribes the listener from the updates
 */
export declare function onQuery<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model> | CollectionGroup<Model>,
  queries: Query<Model, keyof Model>[],
  onResult: OnResult<Model, Environment, ServerTimestamps>,
  onError?: OnError,
  options?: OnQueryOptions<Environment, ServerTimestamps>
): () => void
export {}
