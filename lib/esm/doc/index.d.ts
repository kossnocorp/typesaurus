import type { Ref } from '../ref';
import type { RuntimeEnvironment, ServerDate, ServerTimestampsStrategy } from '../types';
/**
 * The document type. It contains the reference in the DB and the model data.
 */
export declare type Doc<Model> = AnyDoc<Model, RuntimeEnvironment, boolean, ServerTimestampsStrategy>;
export declare type AnyDoc<Model, Environment extends RuntimeEnvironment | undefined, FromCache extends boolean, ServerTimestamps extends ServerTimestampsStrategy> = Environment extends 'node' ? NodeDoc<Model> : FromCache extends false ? WebDoc<Model, false, ServerTimestamps> : ServerTimestamps extends 'estimate' ? WebDoc<Model, false, 'estimate'> : WebDoc<Model, FromCache, ServerTimestamps>;
export interface NodeDoc<Model> {
    __type__: 'doc';
    ref: Ref<Model>;
    data: ModelNodeData<Model>;
    environment: 'node';
    fromCache?: false;
    hasPendingWrites?: false;
    serverTimestamps?: undefined;
}
export interface WebDoc<Model, FromCache extends boolean, ServerTimestamps extends ServerTimestampsStrategy> {
    __type__: 'doc';
    ref: Ref<Model>;
    data: FromCache extends false ? AnyModelData<Model, false> : ServerTimestamps extends 'estimate' ? AnyModelData<Model, false> : AnyModelData<Model, true>;
    environment: 'web';
    fromCache: FromCache;
    hasPendingWrites: boolean;
    serverTimestamps: ServerTimestamps;
}
export declare type ModelNodeData<Model> = AnyModelData<Model, false>;
export declare type ModelData<Model> = AnyModelData<Model, true> | AnyModelData<Model, false>;
export declare type AnyModelData<Model, ServerDateNullable extends boolean> = {
    [Key in keyof Model]: ModelField<Model[Key], ServerDateNullable>;
};
declare type ModelField<Field, ServerDateNullable extends boolean> = Field extends ServerDate ? ServerDateNullable extends true ? Date | null : Date : Field extends Date ? Field : Field extends object ? AnyModelData<Field, ServerDateNullable> : Field;
export declare type ResolvedServerDate<Environment extends RuntimeEnvironment | undefined, FromCache extends boolean, ServerTimestamps extends ServerTimestampsStrategy> = Environment extends 'node' ? Date : ResolvedWebServerDate<FromCache, ServerTimestamps>;
export declare type ResolvedWebServerDate<FromCache extends boolean, ServerTimestamps extends ServerTimestampsStrategy> = FromCache extends false | undefined ? Date : ServerTimestamps extends 'estimate' ? Date : Date | null;
/**
 * Creates a document object.
 *
 * ```ts
 * import { doc, ref, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * doc(ref(users, '00sHm46UWKObv2W7XK9e'), { name: 'Sasha' })
 * //=> {
 * //=>   __type__: 'doc',
 * //=>   data: { name: 'Sasha' },
 * //=>   ref: {,
 * //=>      __type__: 'ref'
 * //=>     collection: { __type__: 'collection', path: 'users' },
 * //=>     id: '00sHm46UWKObv2W7XK9e'
 * //=>   }
 * //=> }
 * ```
 *
 * @param ref - The document reference
 * @param data - The model data
 * @returns The document object
 */
export declare function doc<Model, Environment extends RuntimeEnvironment | undefined, FromCache extends boolean, ServerTimestamps extends ServerTimestampsStrategy>(ref: Ref<Model>, data: Model, meta: {
    environment: Environment;
    fromCache?: FromCache;
    hasPendingWrites?: boolean;
    serverTimestamps?: ServerTimestamps;
}): AnyDoc<Model, Environment, FromCache, ServerTimestamps>;
export {};
