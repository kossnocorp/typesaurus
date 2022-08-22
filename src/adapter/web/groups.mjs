import { collectionGroup, getFirestore } from 'firebase/firestore'
import { all, pathToDoc, _query, wrapData } from './index.mjs'

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
    this.firebaseDB = getFirestore()
    this.name = name
  }

  all() {
    return all(this.adapter())
  }

  query(queries) {
    return _query(this.adapter(), queries)
  }

  adapter() {
    return {
      collection: () => this.firebaseCollection(),
      db: () => this.firebaseDB,
      doc: (snapshot) => pathToDoc(snapshot.ref.path, wrapData(snapshot.data()))
    }
  }

  firebaseCollection() {
    return collectionGroup(this.firebaseDB, this.name)
  }
}
