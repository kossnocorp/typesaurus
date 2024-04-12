import {
  collectionGroup,
  getCountFromServer,
  getAggregateFromServer,
  sum,
  average,
} from "firebase/firestore";
import { _query, all, pathToDoc, queryHelpers, wrapData } from "./core.mjs";
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
      _query(
        this.firestore,
        this.adapter(),
        [].concat(queries(queryHelpers())),
      );

    this.query.build = () => {
      const queries = [];
      return {
        ...queryHelpers("builder", queries),
        run: () => _query(this.firestore, this.adapter(), queries),
      };
    };
  }

  all() {
    return all(this.adapter());
  }

  async count() {
    const snap = await getCountFromServer(
      collectionGroup(this.firestore(), this.name),
    );
    return snap.data().count;
  }

  async sum(field) {
    const snap = await getAggregateFromServer(
      collectionGroup(this.firestore(), this.name),
      { result: sum(field) },
    );
    return snap.data().result;
  }

  async average(field) {
    const snap = await getAggregateFromServer(
      collectionGroup(this.firestore(), this.name),
      { result: average(field) },
    );
    return snap.data().result;
  }

  adapter() {
    return {
      db: () => this.db,
      collection: () => collectionGroup(this.firestore(), this.name),
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
