import { Collection } from '../collection';
import { AddValue } from '../value';
/**
 * Type of the data passed to the set function. It extends the model
 * allowing to set server date field value.
 */
export declare type AddModel<Model> = {
    [Key in keyof Model]: (Model[Key] extends object ? AddModel<Model[Key]> : Model[Key]) | AddValue<Model[Key]>;
};
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
export default function add<Model>(collection: Collection<Model>, data: AddModel<Model>): Promise<import("../ref").Ref<Model>>;
