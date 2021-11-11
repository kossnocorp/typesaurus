import type { Collection } from '../collection';
import type { OperationOptions, RuntimeEnvironment, WriteModel } from '../types';
export declare type AddOptions<Environment extends RuntimeEnvironment | undefined> = OperationOptions<Environment>;
/**
 * Adds a new document with a random id to a collection.
 *
 * ```ts
 * import { add, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const user = await add(users, { name: 'Sasha' })
 * console.log(user.id)
 * //=> '00sHm46UWKObv2W7XK9e'
 * ```
 *
 * @param collection - The collection to add to
 * @param data - The data to add to
 * @returns A promise to the ref
 */
export declare function add<Model, Environment extends RuntimeEnvironment | undefined = undefined>(collection: Collection<Model>, data: WriteModel<Model, Environment>, options?: OperationOptions<Environment>): Promise<import("../ref").Ref<Model>>;
