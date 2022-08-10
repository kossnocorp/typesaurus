import { assertEnvironment, unwrapData, updateHelpers, writeHelpers } from '.'
import type { Typesaurus } from '../..'
import type { TypesaurusBatch } from '../../types/batch'
import * as admin from 'firebase-admin'

export const batch: TypesaurusBatch.Function = (db, options) => {
  assertEnvironment(options?.as)
  const firebaseBatch = admin.firestore().batch()
  return {
    ...batchDB(db, firebaseBatch),
    commit: async () => {
      await firebaseBatch.commit()
    }
  }
}

function batchDB<Schema extends Typesaurus.PlainSchema>(
  rootDB: Typesaurus.DB<Schema>,
  batch: admin.firestore.WriteBatch
): TypesaurusBatch.DB<Schema> {
  function convertDB<SchemaNode extends Typesaurus.PlainSchema>(
    db: Typesaurus.DB<SchemaNode>,
    nestedPath?: string
  ): TypesaurusBatch.DB<SchemaNode> {
    const processedDB = {}

    Object.entries(db).forEach(([path, collection]) => {
      const readCollection = new Collection(
        rootDB,
        batch,
        nestedPath ? `${nestedPath}/${path}` : path
      )

      processedDB[path] =
        typeof collection === 'function'
          ? new Proxy<TypesaurusBatch.NestedCollection<any, any>>(() => {}, {
              get: (_target, prop: keyof typeof readCollection) =>
                readCollection[prop],

              apply: (_target, _prop, [id]: [string]) =>
                convertDB(collection(id), `${collection.path}/${id}`)
            })
          : readCollection
    })

    return processedDB as TypesaurusBatch.DB<SchemaNode>
  }

  const filteredDB: Typesaurus.DB<Schema> = { ...rootDB }
  delete filteredDB.id
  delete filteredDB.groups

  return convertDB(filteredDB)
}

class Collection<Schema extends Typesaurus.PlainSchema, Model>
  implements TypesaurusBatch.Collection<Model>
{
  type: 'collection' = 'collection'

  path: string

  db: Typesaurus.DB<Schema>

  batch: admin.firestore.WriteBatch

  constructor(
    db: Typesaurus.DB<Schema>,
    batch: admin.firestore.WriteBatch,
    path: string
  ) {
    this.db = db
    this.batch = batch
    this.path = path
  }

  set(id: string, data: Typesaurus.WriteModelArg<Model>) {
    const dataToSet = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.set(doc, unwrapData(dataToSet))
  }

  upset(id: string, data: Typesaurus.WriteModelArg<Model>) {
    const dataToUpset = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.set(doc, unwrapData(dataToUpset), { merge: true })
  }

  update(id: string, data: Typesaurus.UpdateModelArg<Model>) {
    const dataToUpdate =
      typeof data === 'function' ? data(updateHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.update(doc, unwrapData(dataToUpdate))
  }

  remove(id: string) {
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.delete(doc)
  }
}

function firebaseCollection(path: string) {
  return admin.firestore().collection(path)
}
