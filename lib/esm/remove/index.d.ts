import { Collection } from '../collection';
import { Ref } from '../ref';
/**
 * @param collection - The collection to remove document in
 * @param id - The id of the documented to remove
 */
export declare function remove<Model>(collection: Collection<Model>, id: string): Promise<void>;
/**
 * @param ref - The reference to the document to remove
 */
export declare function remove<Model>(ref: Ref<Model>): Promise<void>;
