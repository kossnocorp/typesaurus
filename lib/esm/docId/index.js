class DocId {
    constructor() {
        /** Just to not let the class empty, which was causing a typescript bug. */
        this._metaDocId = 0;
    }
}
/**
 * A special sentinel to refer to the ID of a document.
 * It can be used in queries to sort or filter by the document ID.
 *
 * ```ts
 * import { docId, query, collection, where } from 'typesaurus'
 *
 * type Word = { definition: string }
 * const dictionary = collection<Word>('words')
 *
 * query(dictionary, [
 *   where(docId, '>=', 'micro'),
 *   where(docId, '<', 'micrp'),
 *   limit(2)
 * ]).then(startsWithMicro => {
 *   // possibly returns a word list start with 'micro'.
 * })
 * ```
 */
const docId = new DocId();
export { DocId, docId };
//# sourceMappingURL=index.js.map