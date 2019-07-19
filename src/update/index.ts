import firestore from '../adaptor'
import { Collection } from '../collection'
import { UpdateValue } from '../value'
import { Field } from '../field'
import { unwrapData } from '../data'
import { Ref } from '../ref'

export type ModelUpdate<Model> = {
  [Key in keyof Model]?: Model[Key] | UpdateValue<Model[Key]>
}

async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: Field<Model>[]
): Promise<void>

async function update<Model>(
  ref: Ref<Model>,
  data: Field<Model>[]
): Promise<void>

async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: ModelUpdate<Model>
): Promise<void>

async function update<Model>(
  ref: Ref<Model>,
  data: ModelUpdate<Model>
): Promise<void>

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

  const firebaseDoc = firestore.collection(collection.path).doc(id)
  const updateData = Array.isArray(data)
    ? data.reduce(
        (acc, { key, value }) => {
          acc[Array.isArray(key) ? key.join('.') : key] = value
          return acc
        },
        {} as { [key: string]: any }
      )
    : data
  await firebaseDoc.update(unwrapData(updateData))
}

export default update
