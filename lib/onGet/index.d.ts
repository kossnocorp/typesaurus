import { Collection } from '../collection';
import { Doc } from '../doc';
import { Ref } from '../ref';
declare type OnResult<Model> = (doc: Doc<Model> | null) => any;
declare type OnError = (error: Error) => any;
/**
 * @param ref - The reference to the document
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export default function onGet<Model>(ref: Ref<Model>, onResult: OnResult<Model>, onError?: OnError): () => void;
/**
 * @param collection - The document collection
 * @param id - The document id
 * @param onResult - The function which is called with the document when
 * the initial fetch is resolved or the document updates.
 * @param onError - The function is called with error when request fails.
 */
export default function onGet<Model>(collection: Collection<Model>, id: string, onResult: OnResult<Model>, onError?: OnError): () => void;
export {};
