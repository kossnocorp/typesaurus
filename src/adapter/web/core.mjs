import {
  DocumentReference,
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  documentId,
  endAt,
  endBefore,
  getCountFromServer,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  updateDoc,
  where,
  and,
  or,
  getAggregateFromServer,
  sum,
  average,
} from "firebase/firestore";
import { SubscriptionPromise } from "../../sp/index.ts";
import { firestore as createFirestore, firestoreSymbol } from "./firebase.mjs";

export function schema(getSchema, options) {
  let firestore;
  const schema = getSchema(schemaHelpers());
  return db(() => (firestore = firestore || createFirestore(options)), schema);
}

export class Collection {
  constructor(db, name, path) {
    this.db = db;
    this.firestore = db[firestoreSymbol];
    this.type = "collection";
    this.name = name;
    this.path = path;

    this.update = (id, data, options) => {
      assertEnvironment(options?.as);
      const updateData =
        typeof data === "function" ? data(updateHelpers()) : data;
      if (!updateData) return;

      const update = Array.isArray(updateData)
        ? updateFields(updateData)
        : updateData instanceof UpdateField
          ? updateFields([updateData])
          : updateData;

      return updateDoc(
        this.firebaseDoc(id),
        unwrapData(this.firestore, update),
      ).then(() => this.ref(id));
    };

    this.update.build = (id, options) => {
      assertEnvironment(options?.as);
      const fields = [];
      return {
        ...updateHelpers("build", fields),
        run: () =>
          updateDoc(
            this.firebaseDoc(id),
            unwrapData(this.firestore, updateFields(fields)),
          ).then(() => this.ref(id)),
      };
    };

    this.query = (queries, options) => {
      assertEnvironment(options?.as);
      const queriesResult = queries(queryHelpers());
      if (!queriesResult) return;
      return _query(
        this.firestore,
        this.adapter(),
        [].concat(queriesResult).filter((q) => !!q),
      );
    };

    this.query.build = (options) => {
      assertEnvironment(options?.as);
      const queries = [];
      return {
        ...queryHelpers("builder", queries),
        run: () => _query(this.firestore, this.adapter(), queries),
      };
    };
  }

  id(id) {
    if (id) return id;
    else return Promise.resolve(doc(this.firebaseCollection()).id);
  }

  ref(id) {
    return new Ref(this, id);
  }

  doc(id, value, options) {
    if (!value && "id" in id && "data" in id && typeof id.data === "function") {
      const data = id.data();
      if (data) return this.doc(id.id, wrapData(this.db, data));
      else return null;
    } else {
      assertEnvironment(options?.as);
      return new Doc(this, id, value);
    }
  }

  add(data, options) {
    assertEnvironment(options?.as);
    return addDoc(
      this.firebaseCollection(),
      writeData(this.firestore, data),
    ).then((firebaseRef) => this.ref(firebaseRef.id));
  }

  set(id, data, options) {
    assertEnvironment(options?.as);
    return setDoc(this.firebaseDoc(id), writeData(this.firestore, data)).then(
      () => this.ref(id),
    );
  }

  upset(id, data, options) {
    assertEnvironment(options?.as);
    return setDoc(this.firebaseDoc(id), writeData(this.firestore, data), {
      merge: true,
    }).then(() => this.ref(id));
  }

  remove(id) {
    return deleteDoc(this.firebaseDoc(id)).then(() => this.ref(id));
  }

  all(options) {
    assertEnvironment(options?.as);
    return all(this.adapter());
  }

  get(id, options) {
    assertEnvironment(options?.as);
    const doc = this.firebaseDoc(id);

    return new SubscriptionPromise({
      request: request({ kind: "get", path: this.path, id }),

      get: async () => {
        const firebaseSnap = await getDoc(doc);
        const data = firebaseSnap.data();
        if (data) return new Doc(this, id, wrapData(this.db, data));
        return null;
      },

      subscribe: (onResult, onError) =>
        onSnapshot(
          doc,
          (firebaseSnap) => {
            const data = firebaseSnap.data();
            if (data) onResult(new Doc(this, id, wrapData(this.db, data)));
            else onResult(null);
          },
          onError,
        ),
    });
  }

  many(ids, options) {
    assertEnvironment(options?.as);
    const db = this.db;

    return new SubscriptionPromise({
      request: request({ kind: "many", path: this.path, ids }),

      get: () => Promise.all(ids.map((id) => this.get(id))),

      subscribe: (onResult, onError) => {
        // Firestore#getAll doesn't like empty lists
        if (ids.length === 0) {
          onResult([]);
          return () => {};
        }
        let waiting = ids.length;
        const result = new Array(ids.length);
        const offs = ids.map((id, idIndex) =>
          this.get(id)
            .on((doc) => {
              result[idIndex] = doc;
              if (waiting) waiting--;
              if (waiting === 0) onResult(result);
            })
            .catch(onError),
        );
        return () => offs.map((off) => off());
      },
    });
  }

  async count() {
    const snap = await getCountFromServer(this.firebaseCollection());
    return snap.data().count;
  }

  async sum(field) {
    const snap = await getAggregateFromServer(this.firebaseCollection(), {
      result: sum(field),
    });
    return snap.data().result;
  }

  async average(field) {
    const snap = await getAggregateFromServer(this.firebaseCollection(), {
      result: average(field),
    });
    return snap.data().result;
  }

  adapter() {
    return {
      collection: () => this.firebaseCollection(),
      doc: (snapshot) =>
        new Doc(this, snapshot.id, wrapData(this.db, snapshot.data())),
      request: () => ({ path: this.path }),
    };
  }

  firebaseCollection() {
    return collection(this.firestore(), this.path);
  }

  firebaseDoc(id) {
    return doc(this.firestore(), this.path, id);
  }
}

export class Ref {
  constructor(collection, id) {
    this.type = "ref";
    this.collection = collection;
    this.id = id;

    this.update = (data, options) =>
      this.collection.update(this.id, data, options);

    this.update.build = (options) =>
      this.collection.update.build(this.id, options);
  }

  get(options) {
    return this.collection.get(this.id, options);
  }

  set(data, options) {
    return this.collection.set(this.id, data, options);
  }

  upset(data, options) {
    return this.collection.upset(this.id, data, options);
  }

  async remove() {
    return this.collection.remove(this.id);
  }
}

export class Doc {
  constructor(collection, id, data) {
    this.type = "doc";
    this.collection = collection;
    this.ref = new Ref(collection, id);
    this.data = data;
    this.props = {
      environment: "client",
      source: "database", // TODO
      dateStrategy: "none", // TODO
      pendingWrites: false, // TODO
    };

    this.update = (data, options) => this.ref.update(data, options);

    this.update.build = (options) => this.ref.update.build(options);
  }

  get(options) {
    return this.ref.get(options);
  }

  set(data, options) {
    return this.ref.set(data, options);
  }

  upset(data, options) {
    return this.ref.upset(data, options);
  }

  remove() {
    return this.ref.remove();
  }

  test(props) {
    return Object.entries(props).every(
      ([key, value]) => this.props[key] === value,
    );
  }

  narrow(cb) {
    const result = cb(this.data);
    if (result) return this;
  }
}

export function all(adapter) {
  const firebaseCollection = adapter.collection();

  return new SubscriptionPromise({
    request: request({ kind: "all", ...adapter.request() }),

    get: async () => {
      const snapshot = await getDocs(firebaseCollection);
      return snapshot.docs.map((doc) => adapter.doc(doc));
    },

    subscribe: (onResult, onError) =>
      onSnapshot(
        firebaseCollection,
        (firebaseSnap) => {
          const docs = firebaseSnap.docs.map((doc) => adapter.doc(doc));
          const changes = () =>
            firebaseSnap.docChanges().map((change) => ({
              type: change.type,
              oldIndex: change.oldIndex,
              newIndex: change.newIndex,
              doc:
                docs[
                  change.type === "removed" ? change.oldIndex : change.newIndex
                ] ||
                // If change.type indicates 'removed', sometimes (not all the time) `docs` does not
                // contain the removed document. In that case, we'll restore it from `change.doc`:
                adapter.doc(
                  change.doc,
                  // {
                  //   firestoreData: true,
                  //   environment: a.environment,
                  //   serverTimestamps: options?.serverTimestamps,
                  //   ...a.getDocMeta(change.doc)
                  // }
                ),
            }));
          const meta = {
            changes,
            size: firebaseSnap.size,
            empty: firebaseSnap.empty,
          };
          onResult(docs, meta);
        },
        onError,
      ),
  });
}

export function writeData(firestore, data) {
  return unwrapData(
    firestore,
    typeof data === "function" ? data(writeHelpers()) : data,
  );
}

export function writeHelpers() {
  return {
    serverDate: () => ({ type: "value", kind: "serverDate" }),

    remove: () => ({ type: "value", kind: "remove" }),

    increment: (number) => ({
      type: "value",
      kind: "increment",
      number,
    }),

    arrayUnion: (values) => ({
      type: "value",
      kind: "arrayUnion",
      values: [].concat(values),
    }),

    arrayRemove: (values) => ({
      type: "value",
      kind: "arrayRemove",
      values: [].concat(values),
    }),
  };
}

export function updateFields(fields) {
  return fields.reduce((acc, field) => {
    if (!field) return acc;
    const { key, value } = field;
    acc[Array.isArray(key) ? key.join(".") : key] = value;
    return acc;
  }, {});
}

export class UpdateField {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

export function updateHelpers(mode = "helpers", acc) {
  function processField(value) {
    if (mode === "helpers") {
      return value;
    } else {
      // Builder mode
      acc.push(value);
    }
  }

  return {
    ...writeHelpers(),
    field: (...field) => ({
      set: (value) => processField(new UpdateField(field, value)),
    }),
  };
}

function schemaHelpers() {
  return {
    collection() {
      return {
        type: "collection",
        sub(schema) {
          return { type: "collection", schema };
        },
        name(name) {
          return {
            type: "collection",
            name,
            sub(schema) {
              return { type: "collection", name, schema };
            },
          };
        },
      };
    },
  };
}

function db(firestore, schema, nestedPath) {
  const enrichedSchema = { [firestoreSymbol]: firestore };
  return Object.entries(schema).reduce(
    (enrichedSchema, [collectionName, plainCollection]) => {
      const name =
        typeof plainCollection.name === "string"
          ? plainCollection.name
          : collectionName;
      const collection = new Collection(
        enrichedSchema,
        name,
        nestedPath ? `${nestedPath}/${name}` : name,
      );

      if ("schema" in plainCollection) {
        enrichedSchema[collectionName] = new Proxy(() => {}, {
          get: (_target, prop) => {
            if (prop === "schema") return plainCollection.schema;
            else if (prop === "sub")
              return subShortcut(firestore, plainCollection.schema);
            else return collection[prop];
          },
          has(_target, prop) {
            return prop in plainCollection;
          },
          apply: (_target, _prop, [id]) =>
            db(firestore, plainCollection.schema, `${collection.path}/${id}`),
        });
      } else {
        enrichedSchema[collectionName] = collection;
      }
      return enrichedSchema;
    },
    enrichedSchema,
  );
}

function subShortcut(firestore, schema) {
  return Object.entries(schema).reduce(
    (shortcutsSchema, [path, schemaCollection]) => {
      shortcutsSchema[path] = {
        id(id) {
          if (id) return id;
          else return Promise.resolve(doc(collection(firestore(), "any")).id);
        },
      };

      if ("schema" in schemaCollection)
        shortcutsSchema[path].sub = subShortcut(
          firestore,
          schemaCollection.schema,
        );

      return shortcutsSchema;
    },
    {},
  );
}

export function _query(firestore, adapter, queries) {
  const firebaseWhereQueries = [];
  const firebaseRestQueries = [];
  let cursors = [];

  queries.forEach((query) => {
    switch (query.type) {
      case "order": {
        const { field, method, cursors: queryCursors } = query;
        firebaseRestQueries.push(
          orderBy(
            field[0] === "__id__" ? documentId() : field.join("."),
            method,
          ),
        );

        if (queryCursors)
          cursors = cursors.concat(
            queryCursors.reduce((acc, cursor) => {
              if (!cursor) return acc;
              const { type, position, value } = cursor;
              return acc.concat({
                type,
                position,
                value:
                  typeof value === "object" &&
                  value !== null &&
                  "type" in value &&
                  value.type == "doc"
                    ? field[0] === "__id__"
                      ? value.ref.id
                      : field.reduce((acc, key) => acc[key], value.data)
                    : value,
              });
            }, []),
          );
        break;
      }

      case "where": {
        const { field, filter, value } = query;
        firebaseWhereQueries.push(
          where(wherePath(field), filter, unwrapData(firestore, value)),
        );
        break;
      }

      case "limit": {
        firebaseRestQueries.push(limit(query.number));
        break;
      }

      case "or": {
        if (!query.queries.length) break;
        firebaseWhereQueries.push(
          or(
            ...query.queries.map((q) =>
              where(
                wherePath(q.field),
                q.filter,
                unwrapData(firestore, q.value),
              ),
            ),
          ),
        );
        break;
      }
    }
  }, []);

  let groupedCursors = [];

  cursors.forEach((cursor) => {
    let methodValues = groupedCursors.find(
      ([position]) => position === cursor.position,
    );
    if (!methodValues) {
      methodValues = [cursor.position, []];
      groupedCursors.push(methodValues);
    }
    methodValues[1].push(unwrapData(firestore, cursor.value));
  });

  const firebaseCursors = [];

  if (cursors.length && cursors.every((cursor) => cursor.value !== undefined))
    groupedCursors.forEach(([method, values]) => {
      firebaseCursors.push(
        (method === "startAt"
          ? startAt
          : method === "startAfter"
            ? startAfter
            : method === "endAt"
              ? endAt
              : endBefore)(...values),
      );
    });

  const firebaseQuery = () =>
    query(
      adapter.collection(),
      and(...firebaseWhereQueries),
      ...firebaseRestQueries,
      ...firebaseCursors,
    );

  const sp = new SubscriptionPromise({
    request: request({
      kind: "query",
      ...adapter.request(),
      queries: queries,
    }),

    get: async () => {
      const firebaseSnap = await getDocs(firebaseQuery());
      return firebaseSnap.docs.map((firebaseSnap) =>
        adapter.doc(
          firebaseSnap,
          // {
          //   firestoreData: true,
          //   environment: a.environment as Environment,
          //   serverTimestamps: options?.serverTimestamps,
          //   ...a.getDocMeta(firebaseSnap)
          // }
        ),
      );
    },

    subscribe: (onResult, onError) => {
      let q;
      try {
        q = firebaseQuery();
      } catch (error) {
        onError(error);
        return;
      }

      return onSnapshot(
        q,
        (firebaseSnap) => {
          const docs = firebaseSnap.docs.map((firebaseSnap) =>
            adapter.doc(
              firebaseSnap,
              // {
              //   firestoreData: true,
              //   environment: a.environment as Environment,
              //   serverTimestamps: options?.serverTimestamps,
              //   ...a.getDocMeta(firebaseSnap)
              // }
            ),
          );
          const changes = () =>
            firebaseSnap.docChanges().map((change) => ({
              type: change.type,
              oldIndex: change.oldIndex,
              newIndex: change.newIndex,
              doc:
                docs[
                  change.type === "removed" ? change.oldIndex : change.newIndex
                ] ||
                // If change.type indicates 'removed', sometimes (not all the time) `docs` does not
                // contain the removed document. In that case, we'll restore it from `change.doc`:
                adapter.doc(
                  change.doc,
                  // {
                  //   firestoreData: true,
                  //   environment: a.environment,
                  //   serverTimestamps: options?.serverTimestamps,
                  //   ...a.getDocMeta(change.doc)
                  // }
                ),
            }));
          const meta = {
            changes,
            size: firebaseSnap.size,
            empty: firebaseSnap.empty,
          };
          onResult(docs, meta);
        },
        onError,
      );
    },
  });

  Object.assign(sp, {
    count: async () => {
      const snap = await getCountFromServer(firebaseQuery());
      return snap.data().count;
    },

    sum: async (field) => {
      const snap = await getAggregateFromServer(firebaseQuery(), {
        result: sum(field),
      });
      return snap.data().result;
    },

    average: async (field) => {
      const snap = await getAggregateFromServer(firebaseQuery(), {
        result: average(field),
      });
      return snap.data().result;
    },
  });

  return sp;
}

function wherePath(field) {
  return field[0] === "__id__" ? documentId() : field.join(".");
}

export function queryHelpers(mode = "helpers", acc) {
  function processQuery(value) {
    if (mode === "builder") {
      // Push query to the list, to run them later
      acc.push(value);
      // Remove nested or queries because they get added to the acc but we want
      // to process them separately.
      if (value.type === "or")
        for (let index = acc.length - 1; index >= 0; index--)
          if (value.queries.includes(acc[index])) acc.splice(index, 1);
    }
    return value;
  }

  function where(field, filter, value) {
    return processQuery({
      type: "where",
      field,
      filter,
      value,
    });
  }

  return {
    field: (...field) => ({
      lt: where.bind(null, field, "<"),
      lte: where.bind(null, field, "<="),
      eq: where.bind(null, field, "=="),
      not: where.bind(null, field, "!="),
      gt: where.bind(null, field, ">"),
      gte: where.bind(null, field, ">="),
      in: where.bind(null, field, "in"),
      notIn: where.bind(null, field, "not-in"),
      contains: where.bind(null, field, "array-contains"),
      containsAny: where.bind(null, field, "array-contains-any"),

      order: (maybeMethod, maybeCursors) =>
        processQuery({
          type: "order",
          field,
          method: typeof maybeMethod === "string" ? maybeMethod : "asc",
          cursors: maybeCursors
            ? [].concat(maybeCursors)
            : maybeMethod && typeof maybeMethod !== "string"
              ? [].concat(maybeMethod)
              : undefined,
        }),
    }),

    limit: (number) => processQuery({ type: "limit", number }),

    startAt: (value) => ({ type: "cursor", position: "startAt", value }),

    startAfter: (value) => ({ type: "cursor", position: "startAfter", value }),

    endAt: (value) => ({ type: "cursor", position: "endAt", value }),

    endBefore: (value) => ({ type: "cursor", position: "endBefore", value }),

    docId: () => "__id__",

    or: (...queries) => processQuery({ type: "or", queries }),
  };
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument(firestore, ref) {
  return doc(firestore(), ref.collection.path, ref.id);
}

export const pathRegExp = /^(?:(.+\/)?(.+))\/(.+)$/;

/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
export function pathToRef(db, path) {
  const captures = path.match(pathRegExp);
  if (!captures) throw new Error(`Can't parse path ${path}`);
  const [, nestedPath, name, id] = captures;
  return new Ref(new Collection(db, name, (nestedPath || "") + name), id);
}

export function pathToDoc(db, path, data) {
  const captures = path.match(pathRegExp);
  if (!captures) throw new Error(`Can't parse path ${path}`);
  const [, nestedPath, name, id] = captures;
  return new Doc(new Collection(db, name, (nestedPath || "") + name), id, data);
}

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Firestore format
 */
export function unwrapData(firestore, data) {
  if (data && typeof data === "object") {
    if (data.type === "ref") {
      return refToFirestoreDocument(firestore, data);
    } else if (data.type === "value") {
      const fieldValue = data;
      switch (fieldValue.kind) {
        case "remove":
          return deleteField();

        case "increment":
          return increment(fieldValue.number);

        case "arrayUnion":
          return arrayUnion(...unwrapData(firestore, fieldValue.values));

        case "arrayRemove":
          return arrayRemove(...unwrapData(firestore, fieldValue.values));

        case "serverDate":
          return serverTimestamp();
      }
    } else if (data instanceof Date) {
      return Timestamp.fromDate(data);
    }

    const isArray = Array.isArray(data);
    const unwrappedObject = Object.assign(isArray ? [] : {}, data);

    Object.keys(unwrappedObject).forEach((key) => {
      unwrappedObject[key] = unwrapData(firestore, unwrappedObject[key]);
    });

    return unwrappedObject;
  } else if (data === undefined) {
    return null;
  } else {
    return data;
  }
}

/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Typesaurus format
 */
export function wrapData(db, data, ref = pathToRef) {
  if (data instanceof DocumentReference) {
    return ref(db, data.path);
  } else if (data instanceof Timestamp) {
    return data.toDate();
  } else if (data && typeof data === "object") {
    const wrappedData = Object.assign(Array.isArray(data) ? [] : {}, data);
    Object.keys(wrappedData).forEach((key) => {
      wrappedData[key] = wrapData(db, wrappedData[key], ref);
    });
    return wrappedData;
  } else if (typeof data === "string" && data === "%%undefined%%") {
    return undefined;
  } else {
    return data;
  }
}

export function assertEnvironment(environment) {
  if (environment && environment !== "client")
    throw new Error(`Expected ${environment} environment`);
}

function request(payload) {
  return { type: "request", ...payload };
}
