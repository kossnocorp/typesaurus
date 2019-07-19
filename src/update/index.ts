import firestore from '../adaptor'
import { Collection } from '../collection'
import { UpdateValue } from '../value'
import { Field } from '../field'
import { unwrapData } from '../data'

export type ModelUpdate<Model> = {
  [Key in keyof Model]?: Model[Key] | UpdateValue<Model[Key]>
}

async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: Field<Model>[]
): Promise<void>

async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: ModelUpdate<Model>
): Promise<void>

async function update<Model>(
  collection: Collection<Model>,
  id: string,
  data: Field<Model>[] | ModelUpdate<Model>
): Promise<void> {
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
