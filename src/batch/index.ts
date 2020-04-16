import adaptor, { Adaptor, FirebaseWriteBatch } from '../adaptor'
import { Collection } from '../collection'
import { Ref } from '../ref'
import { unwrapData } from '../data'
import { UpdateModel } from '../update'
import { Field } from '../field'
import { SetModel } from '../set'
import { UpsetModel } from '../upset'

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
   * @param ref - The reference to the document to set
   * @param data - The document data
   */
  set<Model>(ref: Ref<Model>, data: SetModel<Model>): void
  /**
   * @param collection - The collection to set document in
   * @param id - The id of the document to set
   * @param data - The document data
   */
  set<Model>(
    collection: Collection<Model>,
    id: string,
    data: SetModel<Model>
  ): void

  /**
   * Sets or updates a document with the given data.
   *
   * ```ts
   * import { batch, collection } from 'typesaurus'
   *
   * type Counter = { count: number }
   * const counters = collection<Counter>('counters')
   *
   * const { upset, commit } = batch()
   *
   * for (let count = 0; count < 500; count++) {
   *   upset(counters, count.toString(), { count })
   * }
   *
   * commit()
   * ```
   *
   * @param ref - The reference to the document to set or update
   * @param data - The document data
   */
  upset<Model>(ref: Ref<Model>, data: UpsetModel<Model>): void
  /**
   * @param collection - The collection to set or update document in
   * @param id - The id of the document to set or update
   * @param data - The document data
   */
  upset<Model>(
    collection: Collection<Model>,
    id: string,
    data: UpsetModel<Model>
  ): void

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
    data: UpdateModel<Model>
  ): void
  /**
   * @param ref - The reference to the document to set
   * @param data - The document data to update
   */
  update<Model>(ref: Ref<Model>, data: UpdateModel<Model>): void

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
 * {@link Batch.upset|upset}, {@link Batch.update|update}, {@link Batch.remove|remove})
 * that are similar to regular set, update and remove with the only difference
 * that the batch counterparts do not return a promise and perform operations
 * only when {@link Batch.commit|commit} function is called.
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
  const commands: BatchCommand[] = []

  const firestoreBatch = lazy(async () => {
    const { firestore } = await adaptor()
    return firestore.batch()
  })

  function set<Model>(
    collectionOrRef: Collection<Model> | Ref<Model>,
    idOrData: string | SetModel<Model>,
    maybeData?: SetModel<Model>
  ): void {
    let collection: Collection<Model>
    let id: string
    let data: SetModel<Model>

    if (collectionOrRef.__type__ === 'collection') {
      collection = collectionOrRef as Collection<Model>
      id = idOrData as string
      data = maybeData as SetModel<Model>
    } else {
      const ref = collectionOrRef as Ref<Model>
      collection = ref.collection
      id = ref.id
      data = idOrData as SetModel<Model>
    }

    commands.push((adaptor, firestoreBatch) => {
      const firestoreDoc = adaptor.firestore.collection(collection.path).doc(id)
      // ^ above
      // TODO: Refactor code above and below because is all the same as in the regular set function
      firestoreBatch.set(firestoreDoc, unwrapData(adaptor, data))
    })
  }

  function upset<Model>(
    collectionOrRef: Collection<Model> | Ref<Model>,
    idOrData: string | UpsetModel<Model>,
    maybeData?: UpsetModel<Model>
  ): void {
    let collection: Collection<Model>
    let id: string
    let data: UpsetModel<Model>

    if (collectionOrRef.__type__ === 'collection') {
      collection = collectionOrRef as Collection<Model>
      id = idOrData as string
      data = maybeData as UpsetModel<Model>
    } else {
      const ref = collectionOrRef as Ref<Model>
      collection = ref.collection
      id = ref.id
      data = idOrData as UpsetModel<Model>
    }

    commands.push((adaptor, firestoreBatch) => {
      const firestoreDoc = adaptor.firestore.collection(collection.path).doc(id)
      // ^ above
      // TODO: Refactor code above and below because is all the same as in the regular set function
      firestoreBatch.set(firestoreDoc, unwrapData(adaptor, data), {
        merge: true
      })
    })
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

    commands.push((adaptor, firestoreBatch) => {
      const firebaseDoc = adaptor.firestore.collection(collection.path).doc(id)
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
      firestoreBatch.update(firebaseDoc, unwrapData(adaptor, updateData))
    })
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

    commands.push((adaptor, firestoreBatch) => {
      const firebaseDoc = adaptor.firestore.collection(collection.path).doc(id)
      // ^ above
      // TODO: Refactor code above because is all the same as in the regular remove function
      firestoreBatch.delete(firebaseDoc)
    })
  }

  async function commit() {
    const a = await adaptor()
    const b = a.firestore.batch()
    commands.forEach(fn => fn(a, b))
    await b.commit()
  }

  return { set, upset, update, remove, commit }
}

type BatchCommand = (adaptor: Adaptor, batch: FirebaseWriteBatch) => void

function lazy<Type>(fn: () => Promise<Type>): () => Promise<Type> {
  let instance: Type | undefined = undefined
  return async () => {
    if (instance === undefined) instance = await fn()
    return instance
  }
}
