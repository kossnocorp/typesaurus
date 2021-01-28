import { Collection } from '../collection';
import { UpdateValue } from '../value';
import { Field } from '../field';
import { Ref } from '../ref';
/**
 * Type of the data passed to the update function. It extends the model
 * making values optional and allow to set value object.
 */
export declare type UpdateModel<Model> = {
    [Key in keyof Model]?: UpdateModel<Model[Key]> | UpdateValue<Model[Key]>;
};
/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
declare function update<Model>(collection: Collection<Model>, id: string, data: Field<Model>[]): Promise<void>;
/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
declare function update<Model>(ref: Ref<Model>, data: Field<Model>[]): Promise<void>;
/**
 * @param collection - the collection to update document in
 * @param id - the id of the document to update
 * @param data - the document data to update
 */
declare function update<Model>(collection: Collection<Model>, id: string, data: UpdateModel<Model>): Promise<void>;
/**
 * @param ref - the reference to the document to set
 * @param data - the document data to update
 */
declare function update<Model>(ref: Ref<Model>, data: UpdateModel<Model>): Promise<void>;
export default update;
