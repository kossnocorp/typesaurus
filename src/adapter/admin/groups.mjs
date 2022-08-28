import * as admin from 'firebase-admin'
import { all, pathToDoc, query, queryHelpers, wrapData } from './index.mjs'

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

    this.query = (queries) =>
      query(this.adapter(), [].concat(queries(queryHelpers())))

    this.query.build = () => {
      const queries = []
      return {
        ...queryHelpers('builder', queries),
        run: () => query(this.adapter(), queries)
      }
    }
  }

  all() {
    return all(this.adapter())
  }

  adapter() {
    return {
      collection: () => this.firebaseCollection(),
      doc: (snapshot) =>
        pathToDoc(snapshot.ref.path, wrapData(snapshot.data())),
      request: () => ({ path: this.name, group: true })
    }
  }

  firebaseCollection() {
    return admin.firestore().collectionGroup(this.name)
  }
}
