import firestore from '../adaptor'
import { Collection } from '../collection'
import { Ref, ref } from '../ref'
import { Doc, doc } from '../doc'
import { unwrapData } from '../data'
import { ModelUpdate } from '../update'
import { Field } from '../field'

/**
 * The batch API object. It unions a set of functions ({@link Batch.set|set},
 * {@link Batch.update|update}, {@link Batch.remove|remove}) that are
 * similar to regular set, update and remove with the only difference that
 * the batch counterparts do not return a promise and perform operations only
 * when {@link Batch.commit|commit} function is called.
 */
export interface Batch {
  /**
   * Sets a document to the given data.
   *
   * ```ts
   * import { batch, collection } from 'typesaurus'
   *
   * type Counter = { count: number }
   * const counters = collection<Counter>('counters')
   *
   * const { set, commit } = batch()
   *
   * for (let count = 0; count < 500; count++) {
   *   set(counters, count.toString(), { count })
   * }
   *
   * commit()
   * ```
   *
   * @returns The document
   *
   * @param ref - The reference to the document to set
   * @param data - The document data
   */
  set<Model>(ref: Ref<Model>, data: Model): Doc<Model>
  /**
   * @param collection - The collection to set document in
   * @param id - The id of the document to set
   * @param data - The document data
   */
  set<Model>(collection: Collection<Model>, id: string, data: Model): Doc<Model>

  /**
   * Updates a document.
   *
   * ```ts
   * import { batch, field, collection } from 'typesaurus'
   *
   * type Counter = { count: number, meta: { updatedAt: number } }
   * const counters = collection<Counter>('counters')
   *
   * const { update, commit } = batch()
   *
   * for (let count = 0; count < 500; count++) {
   *   update(counters, count.toString(), { count: count + 1 })
   *   // or using field paths:
   *   update(counters, count.toString(), [
   *     field('count', count + 1),
   *     field(['meta', 'updatedAt'], Date.now())
   *   ])
   * }
   *
   * commit()
   * ```
   *
   * @returns void
   *
   * @param collection - The collection to update document in
   * @param id - The id of the document to update
   * @param data - The document data to update
   */
  update<Model>(
    collection: Collection<Model>,
    id: string,
    data: Field<Model>[]
  ): void
  /**
   * @param ref - The reference to the document to set
   * @param data - The document data to update
   */
  update<Model>(ref: Ref<Model>, data: Field<Model>[]): void
  /**
   * @param collection - The collection to update document in
   * @param id - The id of the document to update
   * @param data - The document data to update
   */
  update<Model>(
    collection: Collection<Model>,
    id: string,
    data: ModelUpdate<Model>
  ): void
  /**
   * @param ref - The reference to the document to set
   * @param data - The document data to update
   */
  update<Model>(ref: Ref<Model>, data: ModelUpdate<Model>): void

  /**
   * Removes a document.
   *
   * ```ts
   * import { batch, collection } from 'typesaurus'
   *
   * type Counter = { count: number }
   * const counters = collection<Counter>('counters')
   *
   * const { remove, commit } = batch()
   *
   * for (let count = 0; count < 500; count++) {
   *   remove(counters, count.toString())
   * }
   *
   * commit()
   * ```
   *
   * @returns A promise that resolves when the operation is complete
   *
   * @param collection - The collection to remove document in
   * @param id - The id of the documented to remove
   */
  remove<Model>(collection: Collection<Model>, id: string): void
  /**
   * @param ref - The reference to the document to remove
   */
  remove<Model>(ref: Ref<Model>): void

  /**
   * Starts the execution of the operations in the batch.
   *
   * @returns A promise that resolves when the operations are finished
   */
  commit(): Promise<void>
}

/**
 * Creates {@link Batch|batch API} with a set of functions ({@link Batch.set|set},
 * {@link Batch.update|update}, {@link Batch.remove|remove}) that are
 * similar to regular set, update and remove with the only difference that
 * the batch counterparts do not return a promise and perform operations only
 * when {@link Batch.commit|commit} function is called.
 *
 * ```ts
 * import { batch, collection } from 'typesaurus'
 *
 * type Counter = { count: number }
 * const counters = collection<Counter>('counters')
 *
 * const { set, update, remove, commit } = batch()
 *
 * for (let count = 0; count < 500; count++) {
 *   // Each batch can be up to 500 set, update and remove operations
 *   set(counters, count.toString(), { count })
 * }
 *
 * // Set 500 documents
 * commit().then(() => console.log('Done!'))
 * ```
 *
 * @returns The batch API object.
 */
export function batch(): Batch {
  const firestoreBatch = firestore().batch()

  function set<Model>(
    collectionOrRef: Collection<Model> | Ref<Model>,
    idOrData: string | Model,
    maybeData?: Model
  ): Doc<Model> {
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
    firestoreBatch.set(firestoreDoc, unwrapData(data))
    // v below
    return doc(ref(collection, id), data)
  }

  function update<Model>(
    collectionOrRef: Collection<Model> | Ref<Model>,
    idOrData: string | Field<Model>[] | ModelUpdate<Model>,
    maybeData?: Field<Model>[] | ModelUpdate<Model>
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
    firestoreBatch.update(firebaseDoc, unwrapData(updateData))
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

    const firebaseDoc = firestore()
      .collection(collection.path)
      .doc(id)
    // ^ above
    // TODO: Refactor code above because is all the same as in the regular remove function
    firestoreBatch.delete(firebaseDoc)
  }

  async function commit() {
    await firestoreBatch.commit()
  }

  return { set, update, remove, commit }
}
