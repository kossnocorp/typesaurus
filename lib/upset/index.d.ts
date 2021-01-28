import { Collection } from '../collection';
import { Ref } from '../ref';
import { UpsetValue } from '../value';
/**
 * Type of the data passed to the merge function. It extends the model
 * making field values optional and allow to set value object.
 */
export declare type UpsetModel<Model> = {
    [Key in keyof Model]: (Model[Key] extends object ? UpsetModel<Model[Key]> : Model[Key]) | UpsetValue<Model[Key]>;
};
/**
 * @param ref - the reference to the document to set or update
 * @param data - the document data
 */
export default function upset<Model>(ref: Ref<Model>, data: UpsetModel<Model>): Promise<void>;
/**
 * @param collection - the collection to set or update
 * @param id - the id of the document to set or update
 * @param data - the document data
 */
export default function upset<Model>(collection: Collection<Model>, id: string, data: UpsetModel<Model>): Promise<void>;
