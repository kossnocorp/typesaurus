import {
  DocumentReference,
  FieldPath,
  FieldValue,
  Timestamp,
  Filter,
  AggregateField,
} from "firebase-admin/firestore";
import { SubscriptionPromise } from "../../sp/index.ts";
import { firestore as createFirestore, firestoreSymbol } from "./firebase.mjs";

/**
 * The symbol allows to access native Firestore reference/query object from
 * the subscription promise. It enables advanced integrations like
 * the Typesaurus Point-in-Time Recovery adapter.
 */
export const native = Symbol("native");

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

      return (
        Object.keys(update).length
          ? this.firebaseDoc(id).update(unwrapData(this.firestore, update))
          : Promise.resolve()
      ).then(() => this.ref(id));
    };

    this.update.build = (id, options) => {
      assertEnvironment(options?.as);
      const fields = [];
      return {
        ...updateHelpers("build", fields),
        run: async () => {
          if (fields.length)
            await this.firebaseDoc(id).update(
              unwrapData(this.firestore, updateFields(fields)),
            );
          return this.ref(id);
        },
      };
    };

    this.query = (queries, options) => {
      assertEnvironment(options?.as);
      const queriesResult = queries(queryHelpers());
      if (!queriesResult) return;
      return query(
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
        run: () => query(this.firestore, this.adapter(), queries),
      };
    };
  }

  id(id) {
    if (id) return id;
    else return Promise.resolve(this.firebaseCollection().doc().id);
  }

  ref(id) {
    return new Ref(this, id);
  }

  doc(id, value, options) {
    if (!value && "id" in id && "data" in id && typeof id.data === "function") {
      if (id.exists) return this.doc(id.id, wrapData(this.db, id.data()));
      else return null;
    } else {
      assertEnvironment(options?.as);
      return new Doc(this, id, value);
    }
  }

  add(data, options) {
    assertEnvironment(options?.as);
    return this.firebaseCollection()
      .add(writeData(this.firestore, data))
      .then((firebaseRef) => this.ref(firebaseRef.id));
  }

  set(id, data, options) {
    assertEnvironment(options?.as);
    return this.firebaseDoc(id)
      .set(writeData(this.firestore, data))
      .then(() => this.ref(id));
  }

  upset(id, data, options) {
    assertEnvironment(options?.as);
    return this.firebaseDoc(id)
      .set(writeData(this.firestore, data), { merge: true })
      .then(() => this.ref(id));
  }

  async remove(id) {
    await this.firebaseDoc(id).delete();
    return this.ref(id);
  }

  all(options) {
    assertEnvironment(options?.as);
    return all(this.adapter());
  }

  get(id, options) {
    assertEnvironment(options?.as);
    const doc = this.firebaseDoc(id);

    return new SubscriptionPromise({
      request: request({
        [native]: doc,
        kind: "get",
        path: this.path,
        id,
      }),

      get: async () => {
        const firebaseSnap = await doc.get();
        const data = firebaseSnap.data();
        if (data) return new Doc(this, id, wrapData(this.db, data));
        return null;
      },

      subscribe: (onResult, onError) =>
        doc.onSnapshot((firebaseSnap) => {
          const data = firebaseSnap.data();
          if (data) onResult(new Doc(this, id, wrapData(this.db, data)));
          else onResult(null);
        }, onError),
    });
  }

  many(ids, options) {
    assertEnvironment(options?.as);
    const db = this.db;
    const docs = ids.map((id) => this.firebaseDoc(id));

    return new SubscriptionPromise({
      request: request({
        [native]: docs,
        kind: "many",
        path: this.path,
        ids,
      }),

      get: async () => {
        // Firestore#getAll doesn't like empty lists
        if (ids.length === 0) return Promise.resolve([]);
        const firebaseSnap = await this.firestore().getAll(
          ...ids.map((id) => this.firebaseDoc(id)),
        );
        return firebaseSnap.map((firebaseSnap) => {
          if (!firebaseSnap.exists) return null;
          const firestoreData = firebaseSnap.data();
          const data = firestoreData && wrapData(db, firestoreData);
          return new Doc(this, firebaseSnap.id, data);
        });
      },

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
    const snap = await this.adapter().collection().count().get();
    return snap.data().count;
  }

  async sum(field) {
    const snap = await this.adapter()
      .collection()
      .aggregate({ result: AggregateField.sum(field) })
      .get();
    return snap.data().result;
  }

  async average(field) {
    const snap = await this.adapter()
      .collection()
      .aggregate({ result: AggregateField.average(field) })
      .get();
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
    return this.firestore().collection(this.path);
  }

  firebaseDoc(id) {
    return this.firestore().doc(`${this.path}/${id}`);
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

  buildUpdate(data, options) {
    return this.collection.buildUpdate(this.id, data, options);
  }

  async remove() {
    return this.collection.remove(this.id);
  }

  as() {
    return this;
  }
}

export class Doc {
  constructor(collection, id, data) {
    this.type = "doc";
    this.collection = collection;
    this.ref = new Ref(collection, id);
    this.data = data;
    this.props = {
      environment: "server",
      source: "database",
      dateStrategy: "none",
      pendingWrites: false,
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

  as() {
    return this;
  }
}

export function all(adapter) {
  const firebaseCollection = adapter.collection();

  return new SubscriptionPromise({
    request: request({
      [native]: firebaseCollection,
      kind: "all",
      ...adapter.request(),
    }),

    get: async () => {
      const snapshot = await firebaseCollection.get();
      return snapshot.docs.map((doc) => adapter.doc(doc));
    },

    subscribe: (onResult, onError) =>
      firebaseCollection.onSnapshot((firebaseSnap) => {
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
      }, onError),
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
          else return Promise.resolve(firestore().collection("any").doc().id);
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

export function query(firestore, adapter, queries) {
  // Query accumulator, will contain final Firestore query with all the
  // filters and limits.
  let firestoreQuery = adapter.collection();
  let cursors = [];

  queries.forEach((query) => {
    switch (query.type) {
      case "order": {
        const { field, method, cursors: queryCursors } = query;
        firestoreQuery = firestoreQuery.orderBy(
          field[0] === "__id__" ? FieldPath.documentId() : field.join("."),
          method,
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
        firestoreQuery = firestoreQuery.where(
          wherePath(field),
          filter,
          unwrapData(firestore, value),
        );
        break;
      }

      case "limit": {
        firestoreQuery = firestoreQuery.limit(query.number);
        break;
      }

      case "or": {
        if (!query.queries.length) break;
        firestoreQuery = firestoreQuery.where(
          Filter.or(
            ...query.queries.map((q) =>
              Filter.where(
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
  });

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

  if (cursors.length && cursors.every((cursor) => cursor.value !== undefined))
    groupedCursors.forEach(([method, values]) => {
      firestoreQuery = firestoreQuery[method](...values);
    });

  const sp = new SubscriptionPromise({
    request: request({
      [native]: firestoreQuery,
      kind: "query",
      ...adapter.request(),
      queries: queries,
    }),

    get: async () => {
      const firebaseSnap = await firestoreQuery.get();
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

    subscribe: (onResult, onError) =>
      firestoreQuery.onSnapshot((firebaseSnap) => {
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
      }, onError),
  });

  Object.assign(sp, {
    count: async () => {
      const snap = await firestoreQuery.count().get();
      return snap.data().count;
    },

    sum: async (field) => {
      const snap = await firestoreQuery
        .aggregate({ result: AggregateField.sum(field) })
        .get();
      return snap.data().result;
    },

    average: async (field) => {
      const snap = await firestoreQuery
        .aggregate({ result: AggregateField.average(field) })
        .get();
      return snap.data().result;
    },
  });

  return sp;
}

function wherePath(field) {
  return field[0] === "__id__" ? FieldPath.documentId() : field.join(".");
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
 * Generates Firestore path from a reference.
 *
 * @param ref - The reference to a document
 * @returns Firestore path
 */
export function getRefPath(ref) {
  return [ref.collection.path].concat(ref.id).join("/");
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument(firestore, ref) {
  return firestore().doc(getRefPath(ref));
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
          return FieldValue.delete();

        case "increment":
          return FieldValue.increment(fieldValue.number);

        case "arrayUnion":
          return FieldValue.arrayUnion(
            ...unwrapData(firestore, fieldValue.values),
          );

        case "arrayRemove":
          return FieldValue.arrayRemove(
            ...unwrapData(firestore, fieldValue.values),
          );

        case "serverDate":
          return FieldValue.serverTimestamp();
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
  if (environment && environment !== "server")
    throw new Error(`Expected ${environment} environment`);
}

function request(payload) {
  return { type: "request", ...payload };
}
