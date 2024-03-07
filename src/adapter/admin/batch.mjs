import {
  assertEnvironment,
  unwrapData,
  updateHelpers,
  writeHelpers,
} from "./core.mjs";
import { firestoreSymbol } from "./firebase.mjs";

export const batch = (rootDB, options) => {
  assertEnvironment(options?.as);
  const firebaseBatch = rootDB[firestoreSymbol]().batch();
  return Object.assign(
    () => firebaseBatch.commit(),
    batchDB(rootDB, firebaseBatch),
  );
};

function batchDB(rootDB, batch) {
  function convertDB(db) {
    const processedDB = {};
    Object.entries(db).forEach(([alias, collection]) => {
      const readCollection = new Collection(rootDB, batch, collection.path);
      processedDB[alias] =
        typeof collection === "function"
          ? new Proxy(() => {}, {
              get: (_target, prop) => readCollection[prop],
              apply: (_target, _prop, [id]) => convertDB(collection(id)),
            })
          : readCollection;
    });
    return processedDB;
  }

  const filteredDB = { ...rootDB };
  delete filteredDB.id;
  delete filteredDB.groups;
  return convertDB(filteredDB);
}

class Collection {
  constructor(db, batch, path) {
    this.db = db;
    this.firestore = db[firestoreSymbol];
    this.type = "collection";
    this.batch = batch;
    this.path = path;
  }

  set(id, data) {
    const dataToSet = typeof data === "function" ? data(writeHelpers()) : data;
    const doc = this.firestore().collection(this.path).doc(id);
    this.batch.set(doc, unwrapData(this.firestore, dataToSet));
  }

  upset(id, data) {
    const dataToUpset =
      typeof data === "function" ? data(writeHelpers()) : data;
    const doc = this.firestore().collection(this.path).doc(id);
    this.batch.set(doc, unwrapData(this.firestore, dataToUpset), {
      merge: true,
    });
  }

  update(id, data) {
    const dataToUpdate =
      typeof data === "function" ? data(updateHelpers()) : data;

    if (Object.keys(dataToUpdate).length) {
      const doc = this.firestore().collection(this.path).doc(id);
      this.batch.update(doc, unwrapData(this.firestore, dataToUpdate));
    }
  }

  remove(id) {
    const doc = this.firestore().collection(this.path).doc(id);
    this.batch.delete(doc);
  }
}
