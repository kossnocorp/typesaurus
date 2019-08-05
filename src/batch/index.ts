import firestore from '../adaptor'
import { Collection } from '../collection'
import { Ref, ref } from '../ref'
import { Doc, doc } from '../doc'
import { unwrapData } from '../data'
import set from '../set'
import update, { ModelUpdate } from '../update'
import { Field } from '../field'
import clear from '../clear'

export type BatchAPI = {
  set: typeof set
  update: typeof update
  clear: typeof clear
  commit: () => Promise<void>
}

export function batch() {
  const b = firestore().batch()

  // set

  function set<Model>(ref: Ref<Model>, data: Model): Doc<Model>

  function set<Model>(
    collection: Collection<Model>,
    id: string,
    data: Model
  ): Doc<Model>

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
    b.set(firestoreDoc, unwrapData(data))
    // v below
    return doc(ref(collection, id), data)
  }

  // update

  function update<Model>(
    collection: Collection<Model>,
    id: string,
    data: Field<Model>[]
  ): void

  function update<Model>(ref: Ref<Model>, data: Field<Model>[]): void

  function update<Model>(
    collection: Collection<Model>,
    id: string,
    data: ModelUpdate<Model>
  ): void

  function update<Model>(ref: Ref<Model>, data: ModelUpdate<Model>): void

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
    b.update(firebaseDoc, unwrapData(updateData))
  }

  // clear

  function clear<Model>(collection: Collection<Model>, id: string): void

  function clear<Model>(ref: Ref<Model>): void

  function clear<Model>(
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
    // TODO: Refactor code above because is all the same as in the regular update function
    b.delete(firebaseDoc)
  }

  async function commit() {
    await b.commit()
  }

  return {
    set,
    update,
    clear,
    commit
  }
}
