import type { Collection } from '../collection';
import type { Field } from '../field';
import type { Ref } from '../ref';
import type { OperationOptions, RuntimeEnvironment } from '../types';
import type { UpdateValue } from '../value';
export declare type UpdateOptions<Environment extends RuntimeEnvironment | undefined> = OperationOptions<Environment>;
/**
 * Type of the data passed to the update function. It extends the model
 * making values optional and allow to set value object.
 */
export declare type UpdateModel<Model> = {
    [Key in keyof Model]?: UpdateModel<Model[Key]> | UpdateValue<Model, Key>;
};
/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
export declare function update<Model, Environment extends RuntimeEnvironment | undefined>(collection: Collection<Model>, id: string, data: Field<Model>[], options?: UpdateOptions<Environment>): Promise<void>;
/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
export declare function update<Model, Environment extends RuntimeEnvironment | undefined>(ref: Ref<Model>, data: Field<Model>[], options?: UpdateOptions<Environment>): Promise<void>;
/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
export declare function update<Model, Environment extends RuntimeEnvironment | undefined>(collection: Collection<Model>, id: string, data: UpdateModel<Model>, options?: UpdateOptions<Environment>): Promise<void>;
/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
export declare function update<Model, Environment extends RuntimeEnvironment | undefined>(ref: Ref<Model>, data: UpdateModel<Model>, options?: UpdateOptions<Environment>): Promise<void>;
