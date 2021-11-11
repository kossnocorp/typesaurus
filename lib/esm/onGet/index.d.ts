import type { Collection } from '../collection';
import { AnyDoc } from '../doc';
import { Ref } from '../ref';
import type { DocOptions, OperationOptions, RealtimeOptions, RuntimeEnvironment, ServerTimestampsStrategy } from '../types';
export declare type OnGetOptions<Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy> = DocOptions<ServerTimestamps> & OperationOptions<Environment> & RealtimeOptions;
declare type OnResult<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy> = (doc: AnyDoc<Model, Environment, boolean, ServerTimestamps> | null) => any;
declare type OnError = (error: Error) => any;
/**
 * @param ref - The reference to the document
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export declare function onGet<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy>(ref: Ref<Model>, onResult: OnResult<Model, Environment, ServerTimestamps>, onError?: OnError, options?: OnGetOptions<Environment, ServerTimestamps>): () => void;
/**
 * @param collection - The document collection
 * @param id - The document id
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export declare function onGet<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy>(collection: Collection<Model>, id: string, onResult: OnResult<Model, Environment, ServerTimestamps>, onError?: OnError, options?: OnGetOptions<Environment, ServerTimestamps>): () => void;
export {};
