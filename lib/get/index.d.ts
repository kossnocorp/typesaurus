import { Collection } from '../collection';
import { Doc } from '../doc';
import { Ref } from '../ref';
/**
 * @param ref - The reference to the document
 */
declare function get<Model>(ref: Ref<Model>): Promise<Doc<Model> | null>;
/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
declare function get<Model>(collection: Collection<Model>, id: string): Promise<Doc<Model> | null>;
export default get;
