import { all, pathToDoc, query, wrapData } from './index.mjs'
import * as admin from 'firebase-admin'

export const groups = (rootDB) => {
  const groups = {}

  function extract(db) {
    Object.entries(db).forEach(([path, collection]) => {
      if (path in groups) return
      groups[path] = new Group(path)
      if ('schema' in collection) extract(collection.schema)
    })
  }

  extract(rootDB)
  return groups
}

class Group {
  constructor(name) {
    this.name = name
  }

  all() {
    return all(this.adapter())
  }

  query(queries) {
    return query(this.adapter(), queries)
  }

  adapter() {
    return {
      collection: () => this.firebaseCollection(),
      doc: (snapshot) => pathToDoc(snapshot.ref.path, wrapData(snapshot.data()))
    }
  }

  firebaseCollection() {
    return admin.firestore().collectionGroup(this.name)
  }
}
