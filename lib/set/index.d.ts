import { Collection } from '../collection';
import { Ref } from '../ref';
import { SetValue } from '../value';
/**
 * Type of the data passed to the set function. It extends the model
 * allowing to set server date field value.
 */
export declare type SetModel<Model> = {
    [Key in keyof Model]: (Model[Key] extends object ? SetModel<Model[Key]> : Model[Key]) | SetValue<Model[Key]>;
};
/**
 * @param ref - the reference to the document to set
 * @param data - the document data
 */
declare function set<Model>(ref: Ref<Model>, data: SetModel<Model>): Promise<void>;
/**
 * @param collection - the collection to set document in
 * @param id - the id of the document to set
 * @param data - the document data
 */
declare function set<Model>(collection: Collection<Model>, id: string, data: SetModel<Model>): Promise<void>;
export default set;
