import type { Collection } from '../collection';
import { AnyDoc } from '../doc';
import type { CollectionGroup } from '../group';
import type { DocOptions, OperationOptions, RuntimeEnvironment, ServerTimestampsStrategy } from '../types';
export declare type AllOptionns<Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy> = DocOptions<ServerTimestamps> & OperationOptions<Environment>;
/**
 * Returns all documents in a collection.
 *
 * ```ts
 * import { all, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * all(users).then(allUsers => {
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
 * @returns A promise to all documents
 */
export declare function all<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy>(collection: Collection<Model> | CollectionGroup<Model>, options?: AllOptionns<Environment, ServerTimestamps>): Promise<AnyDoc<Model, Environment, boolean, ServerTimestamps>[]>;
