import { doc, getFirestore, writeBatch } from 'firebase/firestore'
import {
  assertEnvironment,
  unwrapData,
  updateHelpers,
  writeHelpers
} from './core.mjs'

export const batch = (rootDB, options) => {
  assertEnvironment(options?.as)
  const firebaseBatch = writeBatch(getFirestore())
  const db = async () => {
    await firebaseBatch.commit()
  }
  Object.assign(db, batchDB(rootDB, firebaseBatch))
  return db
}

function batchDB(rootDB, batch) {
  function convertDB(db, nestedPath) {
    const processedDB = {}
    Object.entries(db).forEach(([path, collection]) => {
      const readCollection = new Collection(
        rootDB,
        batch,
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

class Collection {
  constructor(db, batch, path) {
    this.type = 'collection'
    this.db = db
    this.batch = batch
    this.path = path
    this.firebaseDB = getFirestore()
  }

  set(id, data) {
    const dataToSet = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.batch.set(doc, unwrapData(this.firebaseDB, dataToSet))
  }

  upset(id, data) {
    const dataToUpset = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.batch.set(doc, unwrapData(this.firebaseDB, dataToUpset), {
      merge: true
    })
  }

  update(id, data) {
    const dataToUpdate =
      typeof data === 'function' ? data(updateHelpers()) : data
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.batch.update(doc, unwrapData(this.firebaseDB, dataToUpdate))
  }

  remove(id) {
    const doc = firebaseDoc(this.firebaseDB, this.path, id)
    this.batch.delete(doc)
  }
}

function firebaseDoc(db, path, id) {
  return doc(db, path, id)
}
