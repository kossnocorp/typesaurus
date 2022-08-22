import {
  assertEnvironment,
  unwrapData,
  updateHelpers,
  writeHelpers
} from './index.mjs'
import * as admin from 'firebase-admin'

export const batch = (rootDB, options) => {
  assertEnvironment(options?.as)
  const firebaseBatch = admin.firestore().batch()
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
  }

  set(id, data) {
    const dataToSet = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.set(doc, unwrapData(dataToSet))
  }

  upset(id, data) {
    const dataToUpset = typeof data === 'function' ? data(writeHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.set(doc, unwrapData(dataToUpset), { merge: true })
  }

  update(id, data) {
    const dataToUpdate =
      typeof data === 'function' ? data(updateHelpers()) : data
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.update(doc, unwrapData(dataToUpdate))
  }

  remove(id) {
    const doc = firebaseCollection(this.path).doc(id)
    this.batch.delete(doc)
  }
}

function firebaseCollection(path) {
  return admin.firestore().collection(path)
}
