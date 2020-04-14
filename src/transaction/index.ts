import firestore from '../adaptor'
import { Collection } from '../collection'
import { unwrapData, wrapData } from '../data'
import { Doc, doc } from '../doc'
import { Field } from '../field'
import { Ref, ref } from '../ref'
import { ModelUpdate } from '../update'

interface SetOptions {
  merge?: boolean
}

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
  get<Model>(ref: Ref<Model>): Promise<Doc<Model> | null>
  /**
   * @param collection - The collection to get document from
   * @param id - The document id
   */
  get<Model>(
    collection: Collection<Model>,
    id: string
  ): Promise<Doc<Model> | null>
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
   *   //=> { __type__: 'doc', data: { count: 43 }, ... }
   * )
   * ```
   *
   * @returns A promise to the document
   *
   * @param ref - the reference to the document to set
   * @param data - the document data
   * @param options - { merge: boolean (default: false) }
   */
  set<Model>(
    ref: Ref<Model>,
    data: Model,
    options?: SetOptions
  ): Promise<Doc<Model>>
  /**
   * @param collection - the collection to set document in
   * @param id - the id of the document to set
   * @param data - the document data
   * @param options - { merge: boolean (default: false) }
   */
  set<Model>(
    collection: Collection<Model>,
    id: string,
    data: Model,
    options?: SetOptions
  ): Promise<Doc<Model>>

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
  ): Promise<void>
  /**
   * @param ref - the reference to the document to set
   * @param data - the document data to update
   */
  update<Model>(ref: Ref<Model>, data: Field<Model>[]): Promise<void>
  /**
   * @param collection - the collection to update document in
   * @param id - the id of the document to update
   * @param data - the document data to update
   */
  update<Model>(
    collection: Collection<Model>,
    id: string,
    data: ModelUpdate<Model>
  ): Promise<void>
  /**
   * @param ref - the reference to the document to set
   * @param data - the document data to update
   */
  update<Model>(ref: Ref<Model>, data: ModelUpdate<Model>): Promise<void>

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
  remove<Model>(collection: Collection<Model>, id: string): Promise<void>
  /**
   * @param ref - The reference to the document to remove
   */
  remove<Model>(ref: Ref<Model>): Promise<void>
}

/**
 * The transaction body function type.
 */
export type TransactionReadFunction<ReadResult> = (
  api: TransactionRead
) => Promise<ReadResult>

/**
 * The transaction body function type.
 */
export type TransactionWriteFunction<ReadResult, WriteResult> = (
  api: TransactionWrite<ReadResult>
) => Promise<WriteResult>

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
export function transaction<ReadResult, WriteResult>(
  readFunction: TransactionReadFunction<ReadResult>,
  writeFunction: TransactionWriteFunction<ReadResult, WriteResult>
): Promise<WriteResult> {
  return firestore().runTransaction(t => {
    async function get<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      maybeId?: string
    ): Promise<Doc<Model> | null> {
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

      const firestoreDoc = firestore()
        .collection(collection.path)
        .doc(id)
      // ^ above
      // TODO: Refactor code above and below because is all the same as in the regular get function
      const firestoreSnap = await t.get(firestoreDoc)
      // v below
      const firestoreData = firestoreSnap.data()
      const data = firestoreData && (wrapData(firestoreData) as Model)
      return data ? doc(ref(collection, id), data) : null
    }

    async function set<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      idOrData: string | Model,
      dataOrOptions?: Model | SetOptions,
      maybeOptions?: SetOptions
    ): Promise<Doc<Model>> {
      let collection: Collection<Model>
      let id: string
      let data: Model
      let options: FirebaseFirestore.SetOptions | undefined

      if (collectionOrRef.__type__ === 'collection') {
        collection = collectionOrRef as Collection<Model>
        id = idOrData as string
        data = dataOrOptions as Model
        options = maybeOptions as SetOptions | undefined
      } else {
        const ref = collectionOrRef as Ref<Model>
        collection = ref.collection
        id = ref.id
        data = idOrData as Model
        options = dataOrOptions as FirebaseFirestore.SetOptions | undefined
      }

      const firestoreDoc = firestore()
        .collection(collection.path)
        .doc(id)
      // ^ above
      // TODO: Refactor code above and below because is all the same as in the regular set function
      await t.set(firestoreDoc, unwrapData(data), options)
      // v below
      return doc(ref(collection, id), data)
    }

    async function update<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      idOrData: string | Field<Model>[] | ModelUpdate<Model>,
      maybeData?: Field<Model>[] | ModelUpdate<Model>
    ): Promise<void> {
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

      const firebaseDoc = firestore()
        .collection(collection.path)
        .doc(id)
      const updateData = Array.isArray(data)
        ? data.reduce(
            (acc, { key, value }) => {
              acc[Array.isArray(key) ? key.join('.') : key] = value
              return acc
            },
            {} as { [key: string]: any }
          )
        : data
      // ^ above
      // TODO: Refactor code above because is all the same as in the regular update function
      await t.update(firebaseDoc, unwrapData(updateData))
    }

    async function remove<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      maybeId?: string
    ): Promise<void> {
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

      const firebaseDoc = firestore()
        .collection(collection.path)
        .doc(id)
      // ^ above
      // TODO: Refactor code above because is all the same as in the regular update function
      await t.delete(firebaseDoc)
    }

    return readFunction({ get }).then(data =>
      writeFunction({ data, set, update, remove })
    )
  })
}
