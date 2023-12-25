import { all, pathToDoc, query, queryHelpers, wrapData } from "./core.mjs";
import { firestoreSymbol } from "./firebase.mjs";

export const groups = (rootDB) => {
  const groups = {};

  function extract(db) {
    Object.entries(db).forEach(([path, collection]) => {
      if (path in groups) return;
      groups[path] = new Group(rootDB, path);
      if ("schema" in collection) extract(collection.schema);
    });
  }

  extract(rootDB);
  return groups;
};

class Group {
  constructor(db, name) {
    this.db = db;
    this.firestore = db[firestoreSymbol];
    this.name = name;

    this.query = (queries) =>
      query(this.firestore, this.adapter(), [].concat(queries(queryHelpers())));

    this.query.build = () => {
      const queries = [];
      return {
        ...queryHelpers("builder", queries),
        run: () => query(this.firestore, this.adapter(), queries),
      };
    };
  }

  all() {
    return all(this.adapter());
  }

  async count() {
    const snap = await this.adapter().collection().count().get();
    return snap.data().count;
  }

  adapter() {
    return {
      collection: () => this.firestore().collectionGroup(this.name),
      doc: (snapshot) =>
        pathToDoc(
          this.db,
          snapshot.ref.path,
          wrapData(this.db, snapshot.data()),
        ),
      request: () => ({ path: this.name, group: true }),
    };
  }
}
