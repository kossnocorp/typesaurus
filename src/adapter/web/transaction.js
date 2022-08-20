import { doc, getFirestore, runTransaction } from 'firebase/firestore'
import {
  assertEnvironment,
  unwrapData,
  updateHelpers,
  wrapData,
  writeHelpers
} from './index'

export const transaction = (db, options) => {
  assertEnvironment(options?.as)
  return {
    read: (readCallback) => {
      return {
        write: (writeCallback) =>
          runTransaction(getFirestore(), async (firebaseTransaction) => {
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

function transactionReadHelpers(db, transaction) {
  return {
    db: readDB(db, transaction)
  }
}

function readDB(rootDB, transaction) {
  function convertDB(db, nestedPath) {
    const processedDB = {}
    Object.entries(db).forEach(([path, collection]) => {
      const readCollection = new ReadCollection(
        rootDB,
        transaction,
        nestedPath ? `${nestedPath}/${path}` : path
      )
      processedDB[path] =
        typeof collection === 'function'
          ? new Proxy(() => {}, {
              get: (_target, prop) => readCollection[prop],
              apply: (_target, _prop, [id]) =>
                convertDB(collection(id), `${collection.path}/${id}`)
            })
          : readCollection
    })
    return processedDB
  }

  const filteredDB = { ...rootDB }
  delete filteredDB.id
  delete filteredDB.groups
  return convertDB(filteredDB)
}

class ReadCollection {
  constructor(db, transaction, path) {
    this.type = 'collection'
    this.db = db
    this.path = path
    this.transaction = transaction
    this.firebaseDB = getFirestore()
  }

  async get(id) {
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    const snapshot = await this.transaction.get(doc)
    if (!snapshot.exists()) return null
    return new ReadDoc(
      this,
      id,
      wrapData(snapshot.data(), (path) =>
        pathToWriteRef(this.db, this.transaction, path)
      )
    )
  }
}

class ReadRef {
  constructor(collection, id) {
    this.type = 'ref'
    this.collection = collection
    this.id = id
  }
}

class ReadDoc {
  constructor(collection, id, data) {
    this.type = 'doc'
    this.environment = 'client'
    this.ref = new ReadRef(collection, id)
    this.data = data
  }
}

function firebaseDoc(db, path, id) {
  return doc(db, `${path}/${id}`)
}

function transactionWriteHelpers(db, transaction, data) {
  return {
    db: writeDB(db, transaction),
    data: readDocsToWriteDocs(db, transaction, data)
  }
}

function writeDB(rootDB, transaction) {
  function convertDB(db, nestedPath) {
    const processedDB = {}
    Object.entries(db).forEach(([path, collection]) => {
      const writeCollection = new WriteCollection(
        rootDB,
        transaction,
        nestedPath ? `${nestedPath}/${path}` : path
      )
      processedDB[path] =
        typeof collection === 'function'
          ? new Proxy(() => {}, {
              get: (_target, prop) => writeCollection[prop],
              apply: (_target, _prop, [id]) =>
                convertDB(collection(id), `${collection.path}/${id}`)
            })
          : writeCollection
    })
    return processedDB
  }

  const filteredDB = { ...rootDB }
  delete filteredDB.id
  delete filteredDB.groups
  return convertDB(filteredDB)
}

function readDocsToWriteDocs(db, transaction, data) {
  if (data instanceof ReadDoc) {
    return WriteDoc.fromRead(data)
  } else if (data && typeof data === 'object') {
    const processedData = Array.isArray(data) ? [] : {}
    Object.entries(data).forEach(([key, value]) => {
      processedData[key] = readDocsToWriteDocs(db, transaction, value)
    })
    return processedData
  } else {
    return data
  }
}

class WriteCollection {
  constructor(db, transaction, path) {
    this.type = 'collection'
    this.path = path
    this.db = db
    this.transaction = transaction
    this.firebaseDB = getFirestore()
  }

  set(id, data) {
    const dataToSet = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.transaction.set(doc, unwrapData(this.firebaseDB, dataToSet))
  }

  upset(id, data) {
    const dataToUpset = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.transaction.set(doc, unwrapData(this.firebaseDB, dataToUpset), {
      merge: true
    })
  }

  update(id, data) {
    const dataToUpdate =
      typeof data === 'function' ? data(updateHelpers()) : data
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.transaction.update(doc, unwrapData(this.firebaseDB, dataToUpdate))
  }

  remove(id) {
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.transaction.delete(doc)
  }

  static fromRead(collection) {
    return new WriteCollection(
      collection.db,
      collection.transaction,
      collection.path
    )
  }
}

class WriteRef {
  constructor(collection, id) {
    this.type = 'ref'
    this.collection = collection
    this.id = id
  }

  set(data) {
    return this.collection.set(this.id, data)
  }

  upset(data) {
    return this.collection.upset(this.id, data)
  }

  update(data) {
    return this.collection.update(this.id, data)
  }

  remove() {
    return this.collection.remove(this.id)
  }
}

class WriteDoc {
  constructor(collection, id, data) {
    this.type = 'doc'
    this.environment = 'client'
    this.ref = new WriteRef(collection, id)
    this.data = data
  }

  set(data) {
    return this.ref.set(data)
  }

  upset(data) {
    return this.ref.upset(data)
  }

  update(data) {
    return this.ref.update(data)
  }

  remove() {
    return this.ref.remove()
  }

  static fromRead(doc) {
    return new WriteDoc(
      WriteCollection.fromRead(doc.ref.collection),
      doc.ref.id,
      doc.data
    )
  }
}

export function pathToWriteRef(db, transaction, path) {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return new WriteRef(new WriteCollection(db, transaction, collectionPath), id)
}
