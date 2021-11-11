import type { Collection } from '../collection';
import type { Ref } from '../ref';
import { OperationOptions, RuntimeEnvironment, ServerDate } from '../types';
import { UpsetValue } from '../value';
export declare type UpsetOptions<Environment extends RuntimeEnvironment | undefined> = OperationOptions<Environment>;
/**
 * Type of the data passed to the upset function. It extends the model
 * allowing to set server date field value.
 */
export declare type UpsetModel<Model, Environment extends RuntimeEnvironment | undefined> = {
    [Key in keyof Model]: (Exclude<Model[Key], undefined> extends ServerDate ? Environment extends 'node' ? Date | ServerDate : ServerDate : Model[Key] extends object ? UpsetModel<Model[Key], Environment> : Model[Key]) | UpsetValue<Model[Key]>;
};
/**
 * @param ref - the reference to the document to set or update
 * @param data - the document data
 */
export declare function upset<Model, Environment extends RuntimeEnvironment | undefined>(ref: Ref<Model>, data: UpsetModel<Model, Environment>, options?: UpsetOptions<Environment>): Promise<void>;
/**
 * @param collection - the collection to set or update
 * @param id - the id of the document to set or update
 * @param data - the document data
 */
export declare function upset<Model, Environment extends RuntimeEnvironment | undefined>(collection: Collection<Model>, id: string, data: UpsetModel<Model, Environment>, options?: UpsetOptions<Environment>): Promise<void>;
