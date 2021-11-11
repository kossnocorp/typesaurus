import type { Collection } from '../collection';
import { AnyDoc } from '../doc';
import type { CollectionGroup } from '../group';
import type { SnapshotInfo } from '../snapshot';
import type { DocOptions, OperationOptions, RealtimeOptions, RuntimeEnvironment, ServerTimestampsStrategy } from '../types';
export declare type OnAllOptions<Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy> = DocOptions<ServerTimestamps> & OperationOptions<Environment> & RealtimeOptions;
declare type OnResult<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy> = (docs: AnyDoc<Model, Environment, boolean, ServerTimestamps>[], info: SnapshotInfo<Model>) => any;
declare type OnError = (error: Error) => any;
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
export declare function onAll<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy>(collection: Collection<Model> | CollectionGroup<Model>, onResult: OnResult<Model, Environment, ServerTimestamps>, onError?: OnError, options?: OnAllOptions<Environment, ServerTimestamps>): () => void;
export {};
