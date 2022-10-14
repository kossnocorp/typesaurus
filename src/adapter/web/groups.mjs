import { collectionGroup, getFirestore } from 'firebase/firestore'
import { all, pathToDoc, _query, queryHelpers, wrapData } from './core.mjs'

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

    this.query = (queries) =>
      _query(this.adapter(), [].concat(queries(queryHelpers())))

    this.query.build = () => {
      const queries = []
      return {
        ...queryHelpers('builder', queries),
        run: () => _query(this.adapter(), queries)
      }
    }
  }

  all() {
    return all(this.adapter())
  }

  adapter() {
    return {
      db: () => this.firebaseDB,
      collection: () => this.firebaseCollection(),
      doc: (snapshot) =>
        pathToDoc(snapshot.ref.path, wrapData(snapshot.data())),
      request: () => ({ path: this.name, group: true })
    }
  }

  firebaseCollection() {
    return collectionGroup(this.firebaseDB, this.name)
  }
}
