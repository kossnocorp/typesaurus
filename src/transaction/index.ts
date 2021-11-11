import { getCommon, GetOptions } from '..';
import adaptor from '../adaptor'
import type { Collection } from '../collection'
import { unwrapData, wrapData } from '../data'
import { AnyDoc, doc, Doc } from '../doc'
import type { Field } from '../field'
import { Ref, ref } from '../ref'
import type {
  DocOptions,
  OperationOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy,
  WriteModel
} from '../types'
import type { UpdateModel } from '../update'
import type { UpsetModel } from '../upset'
import { assertEnvironment } from '../_lib/assertEnvironment'

/**
 * The transaction read API object. It contains {@link TransactionRead.get|get}
 * the function that allows reading documents from the database.
 */
export interface TransactionRead<Environment extends RuntimeEnvironment> {
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
  get<Model, ServerTimestamps extends ServerTimestampsStrategy>(
    ref: Ref<Model>,
    options?: DocOptions<ServerTimestamps>
  ): Promise<AnyDoc<Model, Environment, boolean, ServerTimestamps> | null>
  /**
   * @param collection - The collection to get document from
   * @param id - The document id
   */
  get<Model, ServerTimestamps extends ServerTimestampsStrategy>(
    collection: Collection<Model>,
    id: string,
    options?: DocOptions<ServerTimestamps>
  ): Promise<AnyDoc<Model, Environment, boolean, ServerTimestamps> | null>
}

/**
 * The transaction write API object. It unions a set of functions ({@link TransactionWrite.set|set},
 * {@link TransactionWrite.update|update} and {@link TransactionWrite.remove|remove})
 * that are similar to regular set, update and remove with the only
 * difference that the transaction counterparts will retry writes if
 * the state of data received with {@link TransactionRead.get|get} would change.
 */
export interface TransactionWrite<
  Environment extends RuntimeEnvironment,
  ReadResult
> {
  /**
   * The result of the read function.
   */
  data: ReadResult

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
  set<Model>(ref: Ref<Model>, data: WriteModel<Model, Environment>): void
  /**
   * @param collection - the collection to set document in
   * @param id - the id of the document to set
   * @param data - the document data
   */
  set<Model>(
    collection: Collection<Model>,
    id: string,
    data: WriteModel<Model, Environment>
  ): void

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
  upset<Model>(ref: Ref<Model>, data: UpsetModel<Model, Environment>): void
  /**
   * @param collection - the collection to set document in
   * @param id - the id of the document to set
   * @param data - the document data
   */
  upset<Model>(
    collection: Collection<Model>,
    id: string,
    data: UpsetModel<Model, Environment>
  ): void

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
  update<Model>(
    collection: Collection<Model>,
    id: string,
    data: Field<Model>[]
  ): void
  /**
   * @param ref - the reference to the document to set
   * @param data - the document data to update
   */
  update<Model>(ref: Ref<Model>, data: Field<Model>[]): void
  /**
   * @param collection - the collection to update document in
   * @param id - the id of the document to update
   * @param data - the document data to update
   */
  update<Model>(
    collection: Collection<Model>,
    id: string,
    data: UpdateModel<Model>
  ): void
  /**
   * @param ref - the reference to the document to set
   * @param data - the document data to update
   */
  update<Model>(ref: Ref<Model>, data: UpdateModel<Model>): void

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
  remove<Model>(collection: Collection<Model>, id: string): void
  /**
   * @param ref - The reference to the document to remove
   */
  remove<Model>(ref: Ref<Model>): void
}

/**
 * The transaction body function type.
 */
export type TransactionReadFunction<
  Environment extends RuntimeEnvironment,
  ReadResult
> = (api: TransactionRead<Environment>) => Promise<ReadResult>

/**
 * The transaction body function type.
 */
export type TransactionWriteFunction<
  Environment extends RuntimeEnvironment,
  ReadResult,
  WriteResult
> = (api: TransactionWrite<Environment, ReadResult>) => WriteResult

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
export async function transaction<
  Environment extends RuntimeEnvironment,
  ReadResult,
  WriteResult
>(
  readFunction: TransactionReadFunction<Environment, ReadResult>,
  writeFunction: TransactionWriteFunction<Environment, ReadResult, WriteResult>,
  options?: OperationOptions<Environment>
): Promise<WriteResult> {
  const a = await adaptor()

  assertEnvironment(a, options?.assertEnvironment)

  return a.firestore.runTransaction((t) => {

    function set<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      idOrData: string | WriteModel<Model, Environment>,
      maybeData?: WriteModel<Model, Environment>
    ): void {
      let collection: Collection<Model>
      let id: string
      let data: WriteModel<Model, Environment>

      if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef as Collection<Model>
        id = idOrData as string
        data = maybeData!
      } else {
        const ref = collectionOrRef as Ref<Model>
        collection = ref.collection
        id = ref.id
        data = idOrData as WriteModel<Model, Environment>
      }

      const firestoreDoc = a.firestore.collection(collection.path).doc(id)
      // ^ above
      // TODO: Refactor code above and below because is all the same as in the regular set function
      t.set(firestoreDoc, unwrapData(a, data))
    }

    function upset<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      idOrData: string | WriteModel<Model, Environment>,
      maybeData?: UpsetModel<Model, Environment>
    ): void {
      let collection: Collection<Model>
      let id: string
      let data: UpsetModel<Model, Environment>

      if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef as Collection<Model>
        id = idOrData as string
        data = maybeData!
      } else {
        const ref = collectionOrRef as Ref<Model>
        collection = ref.collection
        id = ref.id
        data = idOrData as UpsetModel<Model, Environment>
      }

      const firestoreDoc = a.firestore.collection(collection.path).doc(id)
      // ^ above
      // TODO: Refactor code above and below because is all the same as in the regular set function
      t.set(firestoreDoc, unwrapData(a, data), { merge: true })
    }

    function update<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      idOrData: string | Field<Model>[] | UpdateModel<Model>,
      maybeData?: Field<Model>[] | UpdateModel<Model>
    ): void {
      let collection: Collection<Model>
      let id: string
      let data: Model

      if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef as Collection<Model>
        id = idOrData as string
        data = maybeData as Model
      } else {
        const ref = collectionOrRef as Ref<Model>
        collection = ref.collection
        id = ref.id
        data = idOrData as Model
      }

      const firebaseDoc = a.firestore.collection(collection.path).doc(id)
      const updateData = Array.isArray(data)
        ? data.reduce((acc, { key, value }) => {
            acc[Array.isArray(key) ? key.join('.') : key] = value
            return acc
          }, {} as { [key: string]: any })
        : data
      // ^ above
      // TODO: Refactor code above because is all the same as in the regular update function
      t.update(firebaseDoc, unwrapData(a, updateData))
    }

    function remove<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      maybeId?: string
    ): void {
      let collection: Collection<Model>
      let id: string

      if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef as Collection<Model>
        id = maybeId as string
      } else {
        const ref = collectionOrRef as Ref<Model>
        collection = ref.collection
        id = ref.id
      }

      const firebaseDoc = a.firestore.collection(collection.path).doc(id)
      // ^ above
      // TODO: Refactor code above because is all the same as in the regular update function
      t.delete(firebaseDoc)
    }

    return readFunction({
      get: (...props) => (getCommon as any)(...props, {a, t})
    }).then((data) =>
      writeFunction({ data, set, upset, update, remove })
    )
  })
}
