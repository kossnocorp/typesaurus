import * as admin from 'firebase-admin'
import { unwrapData, updateHelpers, wrapData, writeHelpers } from '.'
import type { Typesaurus } from '../..'
import type { TypesaurusTransaction } from '../../types/transaction'

export const transaction: TypesaurusTransaction.Function = (db, options) => {
  return {
    read: (readCallback) => {
      return {
        write: (writeCallback) =>
          admin.firestore().runTransaction(async (firebaseTransaction) => {
            const data = await readCallback(
              transactionReadHelpers(db, firebaseTransaction)
            )

            return writeCallback(
              transactionWriteHelpers(db, firebaseTransaction, data)
            )
          })
      }
    }
  }
}

function transactionReadHelpers<Schema extends Typesaurus.PlainSchema>(
  db: Typesaurus.RootDB<Schema>,
  transaction: admin.firestore.Transaction
): TypesaurusTransaction.ReadHelpers<Schema> {
  return {
    db: readDB(db, transaction)
  }
}

function readDB<Schema extends Typesaurus.PlainSchema>(
  db: Typesaurus.RootDB<Schema>,
  transaction: admin.firestore.Transaction
): TypesaurusTransaction.ReadDB<Schema> {
  const processedDB = {}

  Object.entries(db).forEach(([key, value]) => {
    // Ignore non-collections
    if (key === 'groups' || key === 'id') return
    // @ts-ignore: making it type-safe is not worth the effort, as it will make
    // the code harder to read
    // TODO: nested collections
    processedDB[key] = new ReadCollection(db, transaction, key)
  })

  return processedDB as TypesaurusTransaction.ReadDB<Schema>
}

class ReadCollection<Schema extends Typesaurus.PlainSchema, Model>
  implements TypesaurusTransaction.ReadCollection<Model>
{
  type: 'collection' = 'collection'

  path: string

  db: Typesaurus.RootDB<Schema>

  transaction: admin.firestore.Transaction

  constructor(
    db: Typesaurus.RootDB<Schema>,
    transaction: admin.firestore.Transaction,
    path: string
  ) {
    this.db = db
    this.path = path
    this.transaction = transaction
  }

  async get(id: string): Promise<ReadDoc<Schema, Model> | null> {
    const doc = firebaseDoc(this.path, id)
    const snapshot = await this.transaction.get(doc)
    if (!snapshot.exists) return null
    // TODO: Expand Ref to WriteRef only
    return new ReadDoc<Schema, Model>(this, id, wrapData(snapshot.data()))
  }
}

class ReadRef<Schema extends Typesaurus.PlainSchema, Model>
  implements TypesaurusTransaction.ReadRef<Model>
{
  type: 'ref' = 'ref'

  collection: ReadCollection<Schema, Model>

  id: string

  constructor(collection: ReadCollection<Schema, Model>, id: string) {
    this.collection = collection
    this.id = id
  }
}

class ReadDoc<Schema extends Typesaurus.PlainSchema, Model>
  implements TypesaurusTransaction.ReadServerDoc<Model>
{
  type: 'doc' = 'doc'

  environment: 'server' = 'server'

  data: Typesaurus.ModelNodeData<Model>

  ref: ReadRef<Schema, Model>

  constructor(
    collection: ReadCollection<Schema, Model>,
    id: string,
    data: Typesaurus.ModelNodeData<Model>
  ) {
    this.ref = new ReadRef<Schema, Model>(collection, id)
    this.data = data
  }
}

function firebaseDoc(path: string, id: string) {
  return admin.firestore().doc(`${path}/${id}`)
}

function firebaseCollection(path: string) {
  return admin.firestore().collection(path)
}

function transactionWriteHelpers<
  Schema extends Typesaurus.PlainSchema,
  ReadResult
>(
  db: Typesaurus.RootDB<Schema>,
  transaction: admin.firestore.Transaction,
  data: ReadResult
): TypesaurusTransaction.WriteHelpers<Schema, ReadResult> {
  return {
    db: writeDB(db, transaction),
    data: readDocsToWriteDocs(db, transaction, data)
  }
}

function writeDB<Schema extends Typesaurus.PlainSchema>(
  db: Typesaurus.RootDB<Schema>,
  transaction: admin.firestore.Transaction
): TypesaurusTransaction.WriteDB<Schema> {
  const processedDB = {}

  Object.entries(db).forEach(([key, value]) => {
    // Ignore non-collections
    if (key === 'groups' || key === 'id') return
    // @ts-ignore: making it type-safe is not worth the effort, as it will make
    // the code harder to read
    // TODO: nested collections
    processedDB[key] = new WriteCollection(db, transaction, key)
  })

  return processedDB as TypesaurusTransaction.WriteDB<Schema>
}

function readDocsToWriteDocs<Schema extends Typesaurus.PlainSchema, ReadResult>(
  db: Typesaurus.RootDB<Schema>,
  transaction: admin.firestore.Transaction,
  data: ReadResult
): TypesaurusTransaction.ReadDocsToWriteDocs<ReadResult> {
  if (data instanceof ReadDoc) {
    return WriteDoc.fromRead(data)
  } else if (data && typeof data === 'object') {
    const processedData = Array.isArray(data) ? [] : {}

    Object.entries(data).forEach(([key, value]) => {
      // @ts-ignore: making it type-safe is not worth the effort, as it will make
      // the code harder to read
      processedData[key] = readDocsToWriteDocs(db, transaction, value)
    })

    return processedData as TypesaurusTransaction.ReadDocsToWriteDocs<ReadResult>
  } else {
    return data as TypesaurusTransaction.ReadDocsToWriteDocs<ReadResult>
  }
}

class WriteCollection<Schema extends Typesaurus.PlainSchema, Model>
  implements TypesaurusTransaction.WriteCollection<Model>
{
  type: 'collection' = 'collection'

  path: string

  db: Typesaurus.RootDB<Schema>

  transaction: admin.firestore.Transaction

  constructor(
    db: Typesaurus.RootDB<Schema>,
    transaction: admin.firestore.Transaction,
    path: string
  ) {
    this.path = path
    this.db = db
    this.transaction = transaction
  }

  set(id: string, data: Typesaurus.WriteModelArg<Model>) {
    const dataToSet = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.transaction.set(doc, unwrapData(dataToSet))
  }

  upset(id: string, data: Typesaurus.WriteModelArg<Model>) {
    const dataToUpset = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.transaction.set(doc, unwrapData(dataToUpset), { merge: true })
  }

  update(id: string, data: Typesaurus.UpdateModelArg<Model>) {
    const dataToUpdate =
      typeof data === 'function' ? data(updateHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.transaction.update(doc, unwrapData(dataToUpdate))
  }

  remove(id: string) {
    const doc = firebaseCollection(this.path).doc(id)
    this.transaction.delete(doc)
  }

  static fromRead<Schema extends Typesaurus.PlainSchema, Model>(
    collection: ReadCollection<Schema, Model>
  ): WriteCollection<Schema, Model> {
    return new WriteCollection<Schema, Model>(
      collection.db,
      collection.transaction,
      collection.path
    )
  }
}

class WriteRef<Schema extends Typesaurus.PlainSchema, Model>
  implements TypesaurusTransaction.WriteRef<Model>
{
  type: 'ref' = 'ref'

  collection: WriteCollection<Schema, Model>

  id: string

  constructor(collection: WriteCollection<Schema, Model>, id: string) {
    this.collection = collection
    this.id = id
  }

  set(data: Typesaurus.WriteModelArg<Model>) {
    return this.collection.set(this.id, data)
  }

  upset(data: Typesaurus.WriteModelArg<Model>) {
    return this.collection.upset(this.id, data)
  }

  update(data: Typesaurus.UpdateModelArg<Model>) {
    return this.collection.update(this.id, data)
  }

  remove() {
    return this.collection.remove(this.id)
  }
}

class WriteDoc<Schema extends Typesaurus.PlainSchema, Model>
  implements TypesaurusTransaction.WriteServerDoc<Model>
{
  type: 'doc' = 'doc'

  environment: 'server' = 'server'

  data: Typesaurus.ModelNodeData<Model>

  ref: WriteRef<Schema, Model>

  constructor(
    collection: WriteCollection<Schema, Model>,
    id: string,
    data: Typesaurus.ModelNodeData<Model>
  ) {
    this.ref = new WriteRef<Schema, Model>(collection, id)
    this.data = data
  }

  set(data: Typesaurus.WriteModelArg<Model>) {
    return this.ref.set(data)
  }

  upset(data: Typesaurus.WriteModelArg<Model>) {
    return this.ref.upset(data)
  }

  update(data: Typesaurus.UpdateModelArg<Model>) {
    return this.ref.update(data)
  }

  remove() {
    return this.ref.remove()
  }

  static fromRead<Schema extends Typesaurus.PlainSchema, Model>(
    doc: ReadDoc<Schema, Model>
  ): WriteDoc<Schema, Model> {
    return new WriteDoc(
      WriteCollection.fromRead(doc.ref.collection),
      doc.ref.id,
      doc.data
    )
  }
}
