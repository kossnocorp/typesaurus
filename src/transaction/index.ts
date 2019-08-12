import firestore from '../adaptor'
import get from '../get'
import { Collection } from '../collection'
import { Ref, ref } from '../ref'
import { Doc, doc } from '../doc'
import { wrapData, unwrapData } from '../data'
import set from '../set'
import update, { ModelUpdate } from '../update'
import { Field } from '../field'
import clear from '../clear'

/**
 * The Transaction API type.
 */
export type TransactionAPI = {
  get: typeof get
  set: typeof set
  update: typeof update
  clear: typeof clear
}

/**
 * The transaction body function type.
 */
export type TransactionFunction = (api: TransactionAPI) => any

/**
 * Performs transaction.
 *
 * @param transactionFn - The transaction body function that accepts transaction API
 * @returns Promise that is resolved when transaction is closed
 *
 * @example
 * import { transaction, collection } from 'typesaurus'
 *
 * type Counter = { count: number }
 * const counters = collection<Counter>('counters')
 *
 * transaction(async ({ get, set, update, clear }) => {
 *   const { data: { count } } = await get('420')
 *   await set(counter, { count: count + 1 })
 * })
 */
export function transaction(transactionFn: TransactionFunction): Promise<any> {
  return firestore().runTransaction(t => {
    /**
     * Retrieves a document from a collection.
     *
     * @returns Promise to the document or undefined if not found
     *
     * @example
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(async ({ get, set }) => {
     *   const counter = await get('420')
     *   //=> { __type__: 'doc', data: { count: 42 }, ... }
     *   await set(counter.ref, { count: counter.data.count + 1 })
     * })
     */
    async function get<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      maybeId?: string
    ): Promise<Doc<Model> | undefined> {
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
      return data ? doc(ref(collection, id), data) : undefined
    }

    /**
     * Sets a document to the given data.
     *
     * @returns A promise to the document
     *
     * @example
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(async ({ get, set }) => {
     *   const counter = await get('420')
     *   await set(counter.ref, { count: counter.data.count + 1 })
     *   //=> { __type__: 'doc', data: { count: 43 }, ... }
     * })
     */
    async function set<Model>(
      collectionOrRef: Collection<Model> | Ref<Model>,
      idOrData: string | Model,
      maybeData?: Model
    ): Promise<Doc<Model>> {
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

      const firestoreDoc = firestore()
        .collection(collection.path)
        .doc(id)
      // ^ above
      // TODO: Refactor code above and below because is all the same as in the regular set function
      await t.set(firestoreDoc, unwrapData(data))
      // v below
      return doc(ref(collection, id), data)
    }

    /**
     * Updates a document.
     *
     * @returns A promise that resolves when operation is finished
     *
     * @example
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(async ({ get, set }) => {
     *   const counter = await get('420')
     *   await update(counter.ref, { count: counter.data.count + 1 })
     *   //=> { __type__: 'doc', data: { count: 43 }, ... }
     *   // Or using key paths:
     *   await update(users, '00sHm46UWKObv2W7XK9e', [
     *     ['name', 'Sasha Koss'],
     *     [['address', 'city'], 'Moscow']
     *   ])
     * })
     */
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

    /**
     * Removes a document.
     *
     * @example
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(async ({ get, set }) => {
     *   const counter = await get('420')
     *   await update(counter.ref, { count: counter.data.count + 1 })
     *   //=> { __type__: 'doc', data: { count: 43 }, ... }
     *   // Or using key paths:
     *   await update(users, '00sHm46UWKObv2W7XK9e', [
     *     ['name', 'Sasha Koss'],
     *     [['address', 'city'], 'Moscow']
     *   ])
     * })
     */
    async function clear<Model>(
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

    return transactionFn({ get, set, update, clear })
  })
}