import { Collection } from '../collection';
import { Doc } from '../doc';
import { Field } from '../field';
import { Ref } from '../ref';
import { SetModel } from '../set';
import { UpdateModel } from '../update';
import { UpsetModel } from '../upset';
/**
 * The transaction read API object. It contains {@link TransactionRead.get|get}
 * the function that allows reading documents from the database.
 */
export interface TransactionRead {
    /**
     * Retrieves a document from a collection.
     *
     * ```ts
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   //=> { __type__: 'doc', data: { count: 42 }, ... }
     *   ({ data: counter, set }) =>
     *     set(counter.ref, { count: counter.data.count + 1 })
     * )
     * ```
     *
     * @returns Promise to the document or null if not found
     *
     * @param ref - The reference to the document
     */
    get<Model>(ref: Ref<Model>): Promise<Doc<Model> | null>;
    /**
     * @param collection - The collection to get document from
     * @param id - The document id
     */
    get<Model>(collection: Collection<Model>, id: string): Promise<Doc<Model> | null>;
}
/**
 * The transaction write API object. It unions a set of functions ({@link TransactionWrite.set|set},
 * {@link TransactionWrite.update|update} and {@link TransactionWrite.remove|remove})
 * that are similar to regular set, update and remove with the only
 * difference that the transaction counterparts will retry writes if
 * the state of data received with {@link TransactionRead.get|get} would change.
 */
export interface TransactionWrite<ReadResult> {
    /**
     * The result of the read function.
     */
    data: ReadResult;
    /**
     * Sets a document to the given data.
     *
     * ```ts
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, set }) =>
     *     set(counter.ref, { count: counter.data.count + 1 })
     * )
     * ```
     *
     * @param ref - the reference to the document to set
     * @param data - the document data
     */
    set<Model>(ref: Ref<Model>, data: SetModel<Model>): void;
    /**
     * @param collection - the collection to set document in
     * @param id - the id of the document to set
     * @param data - the document data
     */
    set<Model>(collection: Collection<Model>, id: string, data: SetModel<Model>): void;
    /**
     * Sets or updates a document with the given data.
     *
     * ```ts
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, upset }) =>
     *     upset(counter.ref, { count: counter.data.count + 1 })
     * )
     * ```
     *
     * @param ref - the reference to the document to set or update
     * @param data - the document data
     */
    upset<Model>(ref: Ref<Model>, data: UpsetModel<Model>): void;
    /**
     * @param collection - the collection to set document in
     * @param id - the id of the document to set
     * @param data - the document data
     */
    upset<Model>(collection: Collection<Model>, id: string, data: UpsetModel<Model>): void;
    /**
     * Updates a document.
     *
     * ```ts
     * import { transaction, field, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, update }) =>
     *     update(counter.ref, { count: counter.data.count + 1 })
     *   //=> { __type__: 'doc', data: { count: 43 }, ... }
     * )
     *
     * // ...or using field paths:
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, update }) =>
     *     update(counter.ref, [field('count', counter.data.count + 1)])
     * )
     * ```
     *
     * @returns A promise that resolves when operation is finished
     *
     * @param collection - the collection to update document in
     * @param id - the id of the document to update
     * @param data - the document data to update
     */
    update<Model>(collection: Collection<Model>, id: string, data: Field<Model>[]): void;
    /**
     * @param ref - the reference to the document to set
     * @param data - the document data to update
     */
    update<Model>(ref: Ref<Model>, data: Field<Model>[]): void;
    /**
     * @param collection - the collection to update document in
     * @param id - the id of the document to update
     * @param data - the document data to update
     */
    update<Model>(collection: Collection<Model>, id: string, data: UpdateModel<Model>): void;
    /**
     * @param ref - the reference to the document to set
     * @param data - the document data to update
     */
    update<Model>(ref: Ref<Model>, data: UpdateModel<Model>): void;
    /**
     * Removes a document.
     *
     * ```ts
     * import { transaction, field, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(async ({ get, remove }) => {
     *   const counter = await get('420')
     *   if (counter === 420) await remove(counter.ref)
     * })
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, remove }) => {
     *     console.log(counter.data.count)
     *     return remove(counter.ref)
     *   }
     * )
     * ```
     *
     * @returns Promise that resolves when the operation is complete.
     *
     * @param collection - The collection to remove document in
     * @param id - The id of the documented to remove
     */
    remove<Model>(collection: Collection<Model>, id: string): void;
    /**
     * @param ref - The reference to the document to remove
     */
    remove<Model>(ref: Ref<Model>): void;
}
/**
 * The transaction body function type.
 */
export declare type TransactionReadFunction<ReadResult> = (api: TransactionRead) => Promise<ReadResult>;
/**
 * The transaction body function type.
 */
export declare type TransactionWriteFunction<ReadResult, WriteResult> = (api: TransactionWrite<ReadResult>) => Promise<WriteResult>;
/**
 * The function allows performing transactions. It accepts two functions.
 * The first receives {@link TransactionRead|transaction read API} that allows
 * getting data from the database and pass it to the second function.
 * The second function gets {@link TransactionWrite|transaction write API}
 * with the data returned from the first function as `data` property of the argument.
 *
 * ```ts
 * import { transaction, collection } from 'typesaurus'
 *
 * type Counter = { count: number }
 * const counters = collection<Counter>('counters')
 *
 * transaction(
 *   ({ get }) => get('420'),
 *   ({ data: counter, update }) =>
 *     update(counter.ref, { count: counter.data.count + 1 })
 * )
 * ```
 *
 * @param readFunction - the transaction read function that accepts transaction
 *   read API and returns data for write function
 * @param writeFunction - the transaction write function that accepts
 *   transaction write API with the data returned by the read function
 * @returns Promise that is resolved when transaction is closed
 */
export declare function transaction<ReadResult, WriteResult>(readFunction: TransactionReadFunction<ReadResult>, writeFunction: TransactionWriteFunction<ReadResult, WriteResult>): Promise<WriteResult>;
