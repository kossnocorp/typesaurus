import {
  doc,
  setDoc,
  getFirestore,
  collection,
  addDoc,
  getDoc,
  DocumentReference,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteField,
  getDocs,
  deleteDoc,
  onSnapshot,
  updateDoc,
  limit,
  where,
  orderBy,
  startAt,
  startAfter,
  endAt,
  endBefore,
  documentId,
  query
} from 'firebase/firestore'
import { TypesaurusUtils } from '../../utils/index.ts'

export { batch } from './batch.mjs'

export { transaction } from './transaction.mjs'

export { groups } from './groups.mjs'

export function schema(getSchema) {
  const schema = getSchema(schemaHelpers())
  return db(schema)
}

class RichCollection {
  constructor(path) {
    this.type = 'collection'
    this.path = path
    this.firebaseDB = getFirestore()

    this.update = (id, data, options) => {
      assertEnvironment(options?.as)
      const updateData =
        typeof data === 'function' ? data(updateHelpers()) : data
      const update = Array.isArray(updateData)
        ? updateFields(updateData)
        : updateData

      return updateDoc(
        this.firebaseDoc(id),
        unwrapData(this.firebaseDB, update)
      ).then(() => this.ref(id))
    }

    this.update.build = (id, options) => {
      assertEnvironment(options?.as)
      const fields = []
      return {
        ...updateHelpers('build', fields),
        run: () =>
          updateDoc(
            this.firebaseDoc(id),
            unwrapData(this.firebaseDB, updateFields(fields))
          ).then(() => this.ref(id))
      }
    }

    this.query = (queries, options) => {
      assertEnvironment(options?.as)
      return _query(this.adapter(), [].concat(queries(queryHelpers())))
    }

    this.query.build = (options) => {
      assertEnvironment(options?.as)
      const queries = []
      return {
        ...queryHelpers('builder', queries),
        run: () => _query(this.adapter(), queries)
      }
    }
  }

  id(id) {
    if (id) return id
    else return Promise.resolve(doc(this.firebaseCollection()).id)
  }

  ref(id) {
    return new Ref(this, id)
  }

  doc(id, data) {
    return new Doc(this, id, nullifyData(data))
  }

  add(data, options) {
    assertEnvironment(options?.as)
    return addDoc(
      this.firebaseCollection(),
      writeData(this.firebaseDB, data)
    ).then((firebaseRef) => this.ref(firebaseRef.id))
  }

  set(id, data, options) {
    assertEnvironment(options?.as)
    return setDoc(this.firebaseDoc(id), writeData(this.firebaseDB, data)).then(
      () => this.ref(id)
    )
  }

  upset(id, data, options) {
    assertEnvironment(options?.as)
    return setDoc(this.firebaseDoc(id), writeData(this.firebaseDB, data), {
      merge: true
    }).then(() => this.ref(id))
  }

  remove(id) {
    return deleteDoc(this.firebaseDoc(id)).then(() => this.ref(id))
  }

  all(options) {
    assertEnvironment(options?.as)
    return all(this.adapter())
  }

  get(id, options) {
    assertEnvironment(options?.as)
    const doc = this.firebaseDoc(id)

    return new TypesaurusUtils.SubscriptionPromise({
      request: request({ kind: 'get', path: this.path, id }),

      get: async () => {
        const firebaseSnap = await getDoc(doc)
        const data = firebaseSnap.data()
        if (data) return new Doc(this, id, wrapData(data))
        return null
      },

      subscribe: (onResult, onError) =>
        onSnapshot(
          doc,
          (firebaseSnap) => {
            const data = firebaseSnap.data()
            if (data) onResult(new Doc(this, id, wrapData(data)))
            else onResult(null)
          },
          onError
        )
    })
  }

  many(ids, options) {
    assertEnvironment(options?.as)

    return new TypesaurusUtils.SubscriptionPromise({
      request: request({ kind: 'many', path: this.path, ids }),

      get: () => Promise.all(ids.map((id) => this.get(id))),

      subscribe: (onResult, onError) => {
        // Firestore#getAll doesn't like empty lists
        if (ids.length === 0) {
          onResult([])
          return () => {}
        }
        let waiting = ids.length
        const result = new Array(ids.length)
        const offs = ids.map((id, idIndex) =>
          this.get(id)
            .on((doc) => {
              result[idIndex] = doc
              if (waiting) waiting--
              if (waiting === 0) onResult(result)
            })
            .catch(onError)
        )
        return () => offs.map((off) => off())
      }
    })
  }

  adapter() {
    return {
      db: () => this.firebaseDB,
      collection: () => this.firebaseCollection(),
      doc: (snapshot) => new Doc(this, snapshot.id, wrapData(snapshot.data())),
      request: () => ({ path: this.path })
    }
  }

  firebaseCollection() {
    return collection(this.firebaseDB, this.path)
  }

  firebaseDoc(id) {
    return doc(this.firebaseDB, this.path, id)
  }
}

class Ref {
  constructor(collection, id) {
    this.type = 'ref'
    this.collection = collection
    this.id = id

    this.update = (data, options) =>
      this.collection.update(this.id, data, options)

    this.update.build = (options) =>
      this.collection.update.build(this.id, options)
  }

  get(options) {
    return this.collection.get(this.id, options)
  }

  set(data, options) {
    return this.collection.set(this.id, data, options)
  }

  upset(data, options) {
    return this.collection.upset(this.id, data, options)
  }

  async remove() {
    return this.collection.remove(this.id)
  }
}

class Doc {
  constructor(collection, id, data) {
    this.type = 'doc'
    this.collection = collection
    this.ref = new Ref(collection, id)
    this.data = data
    this.environment = 'client'

    this.update = (data, options) => this.ref.update(data, options)

    this.update.build = (options) => this.ref.update.build(options)
  }

  get(options) {
    return this.ref.get(options)
  }

  set(data, options) {
    return this.ref.set(data, options)
  }

  upset(data, options) {
    return this.ref.upset(data, options)
  }

  remove() {
    return this.ref.remove()
  }
}

export function all(adapter) {
  const firebaseCollection = adapter.collection()

  return new TypesaurusUtils.SubscriptionPromise({
    request: request({ kind: 'all', ...adapter.request() }),

    get: async () => {
      const snapshot = await getDocs(firebaseCollection)
      return snapshot.docs.map((doc) => adapter.doc(doc))
    },

    subscribe: (onResult, onError) =>
      onSnapshot(
        firebaseCollection,
        (firebaseSnap) => {
          const docs = firebaseSnap.docs.map((doc) => adapter.doc(doc))
          const changes = () =>
            firebaseSnap.docChanges().map((change) => ({
              type: change.type,
              oldIndex: change.oldIndex,
              newIndex: change.newIndex,
              doc:
                docs[
                  change.type === 'removed' ? change.oldIndex : change.newIndex
                ] ||
                // If change.type indicates 'removed', sometimes (not all the time) `docs` does not
                // contain the removed document. In that case, we'll restore it from `change.doc`:
                adapter.doc(
                  change.doc
                  // {
                  //   firestoreData: true,
                  //   environment: a.environment,
                  //   serverTimestamps: options?.serverTimestamps,
                  //   ...a.getDocMeta(change.doc)
                  // }
                )
            }))
          const meta = {
            changes,
            size: firebaseSnap.size,
            empty: firebaseSnap.empty
          }
          onResult(docs, meta)
        },
        onError
      )
  })
}

export function writeData(db, data) {
  return unwrapData(
    db,
    typeof data === 'function' ? data(writeHelpers()) : data
  )
}

export function writeHelpers() {
  return {
    serverDate: () => ({ type: 'value', kind: 'serverDate' }),

    remove: () => ({ type: 'value', kind: 'remove' }),

    increment: (number) => ({
      type: 'value',
      kind: 'increment',
      number
    }),

    arrayUnion: (values) => ({
      type: 'value',
      kind: 'arrayUnion',
      values: [].concat(values)
    }),

    arrayRemove: (values) => ({
      type: 'value',
      kind: 'arrayRemove',
      values: [].concat(values)
    })
  }
}

export function updateFields(fields) {
  return fields.reduce((acc, field) => {
    if (!field) return
    const { key, value } = field
    acc[Array.isArray(key) ? key.join('.') : key] = value
    return acc
  }, {})
}

export function updateHelpers(mode = 'helpers', acc) {
  function processField(value) {
    if (mode === 'helpers') {
      return value
    } else {
      // Builder mode
      acc.push(value)
    }
  }

  return {
    ...writeHelpers(),
    field: (...field) => ({
      set: (value) => processField({ key: field, value })
    })
  }
}

function schemaHelpers() {
  return {
    collection() {
      return {
        type: 'collection',
        sub(schema) {
          return { type: 'collection', schema }
        }
      }
    }
  }
}

function db(schema, nestedPath) {
  return Object.entries(schema).reduce(
    (enrichedSchema, [path, plainCollection]) => {
      const collection = new RichCollection(
        nestedPath ? `${nestedPath}/${path}` : path
      )
      enrichedSchema[path] =
        'schema' in plainCollection
          ? new Proxy(() => {}, {
              get: (_target, prop) => {
                if (prop === 'schema') return plainCollection.schema
                else return collection[prop]
              },
              has(_target, prop) {
                return prop in plainCollection
              },
              apply: (_target, prop, [id]) =>
                db(plainCollection.schema, `${collection.path}/${id}`)
            })
          : collection
      return enrichedSchema
    },
    {}
  )
}

export function _query(adapter, queries) {
  const firebaseQueries = []
  let cursors = []

  queries.forEach((query) => {
    switch (query.type) {
      case 'order': {
        const { field, method, cursors: queryCursors } = query
        firebaseQueries.push(
          orderBy(
            field[0] === '__id__' ? documentId() : field.join('.'),
            method
          )
        )

        if (queryCursors)
          cursors = cursors.concat(
            queryCursors.map(({ type, position, value }) => ({
              type,
              position,
              value:
                typeof value === 'object' &&
                value !== null &&
                'type' in value &&
                value.type == 'doc'
                  ? field[0] === '__id__'
                    ? value.ref.id
                    : field.reduce((acc, key) => acc[key], value.data)
                  : value
            }))
          )
        break
      }

      case 'where': {
        const { field, filter, value } = query
        firebaseQueries.push(
          where(
            field[0] === '__id__' ? documentId() : field.join('.'),
            filter,
            unwrapData(adapter.db(), value)
          )
        )
        break
      }

      case 'limit': {
        firebaseQueries.push(limit(query.number))
        break
      }
    }

    return firebaseQueries
  }, [])

  let groupedCursors = []

  cursors.forEach((cursor) => {
    let methodValues = groupedCursors.find(
      ([position]) => position === cursor.position
    )
    if (!methodValues) {
      methodValues = [cursor.position, []]
      groupedCursors.push(methodValues)
    }
    methodValues[1].push(unwrapData(adapter.db(), cursor.value))
  })

  const firebaseCursors = []

  if (cursors.length && cursors.every((cursor) => cursor.value !== undefined))
    groupedCursors.forEach(([method, values]) => {
      firebaseCursors.push(
        (method === 'startAt'
          ? startAt
          : method === 'startAfter'
          ? startAfter
          : method === 'endAt'
          ? endAt
          : endBefore)(...values)
      )
    })

  const firebaseQuery = () =>
    query(adapter.collection(), ...firebaseQueries, ...firebaseCursors)

  return new TypesaurusUtils.SubscriptionPromise({
    request: request({
      kind: 'query',
      ...adapter.request(),
      queries: queries
    }),

    get: async () => {
      const firebaseSnap = await getDocs(firebaseQuery())
      return firebaseSnap.docs.map((firebaseSnap) =>
        adapter.doc(
          firebaseSnap
          // {
          //   firestoreData: true,
          //   environment: a.environment as Environment,
          //   serverTimestamps: options?.serverTimestamps,
          //   ...a.getDocMeta(firebaseSnap)
          // }
        )
      )
    },

    subscribe: (onResult, onError) => {
      let q
      try {
        q = firebaseQuery()
      } catch (error) {
        onError(error)
        return
      }

      return onSnapshot(
        q,
        (firebaseSnap) => {
          const docs = firebaseSnap.docs.map((firebaseSnap) =>
            adapter.doc(
              firebaseSnap
              // {
              //   firestoreData: true,
              //   environment: a.environment as Environment,
              //   serverTimestamps: options?.serverTimestamps,
              //   ...a.getDocMeta(firebaseSnap)
              // }
            )
          )
          const changes = () =>
            firebaseSnap.docChanges().map((change) => ({
              type: change.type,
              oldIndex: change.oldIndex,
              newIndex: change.newIndex,
              doc:
                docs[
                  change.type === 'removed' ? change.oldIndex : change.newIndex
                ] ||
                // If change.type indicates 'removed', sometimes (not all the time) `docs` does not
                // contain the removed document. In that case, we'll restore it from `change.doc`:
                adapter.doc(
                  change.doc
                  // {
                  //   firestoreData: true,
                  //   environment: a.environment,
                  //   serverTimestamps: options?.serverTimestamps,
                  //   ...a.getDocMeta(change.doc)
                  // }
                )
            }))
          const meta = {
            changes,
            size: firebaseSnap.size,
            empty: firebaseSnap.empty
          }
          onResult(docs, meta)
        },
        onError
      )
    }
  })
}

export function queryHelpers(mode = 'helpers', acc) {
  function processQuery(value) {
    if (mode === 'helpers') {
      return value
    } else {
      // Builder mode
      acc.push(value)
    }
  }

  function where(field, filter, value) {
    return processQuery({
      type: 'where',
      field,
      filter,
      value
    })
  }

  return {
    field: (...field) => ({
      less: where.bind(null, field, '<'),
      lessOrEqual: where.bind(null, field, '<='),
      equal: where.bind(null, field, '=='),
      not: where.bind(null, field, '!='),
      more: where.bind(null, field, '>'),
      moreOrEqual: where.bind(null, field, '>='),
      in: where.bind(null, field, 'in'),
      notIn: where.bind(null, field, 'not-in'),
      contains: where.bind(null, field, 'array-contains'),
      containsAny: where.bind(null, field, 'array-contains-any'),

      order: (...args) =>
        processQuery({
          type: 'order',
          field,
          method: typeof args[0] === 'string' ? args[0] : 'asc',
          cursors:
            args.length > 1
              ? args.slice(1)
              : typeof args[0] === 'object'
              ? args
              : undefined
        })
    }),

    limit: (number) => processQuery({ type: 'limit', number }),

    startAt: (value) => ({ type: 'cursor', position: 'startAt', value }),

    startAfter: (value) => ({ type: 'cursor', position: 'startAfter', value }),

    endAt: (value) => ({ type: 'cursor', position: 'endAt', value }),

    endBefore: (value) => ({ type: 'cursor', position: 'endBefore', value }),

    docId: () => '__id__'
  }
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument(db, ref) {
  return doc(db, ref.collection.path, ref.id)
}

/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
export function pathToRef(path) {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return new Ref(new RichCollection(collectionPath), id)
}

export function pathToDoc(path, data) {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return new Doc(new RichCollection(collectionPath), id, data)
}

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Firestore format
 */
export function unwrapData(db, data) {
  if (data && typeof data === 'object') {
    if (data.type === 'ref') {
      return refToFirestoreDocument(db, data)
    } else if (data.type === 'value') {
      const fieldValue = data
      switch (fieldValue.kind) {
        case 'remove':
          return deleteField()

        case 'increment':
          return increment(fieldValue.number)

        case 'arrayUnion':
          return arrayUnion(...unwrapData(db, fieldValue.values))

        case 'arrayRemove':
          return arrayRemove(...unwrapData(db, fieldValue.values))

        case 'serverDate':
          return serverTimestamp()
      }
    } else if (data instanceof Date) {
      return Timestamp.fromDate(data)
    }

    const unwrappedObject = Object.assign(Array.isArray(data) ? [] : {}, data)

    Object.keys(unwrappedObject).forEach((key) => {
      unwrappedObject[key] = unwrapData(db, unwrappedObject[key])
    })

    return unwrappedObject
  } else if (data === undefined) {
    return null
  } else {
    return data
  }
}

/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Typesaurus format
 */
export function wrapData(data, ref = pathToRef) {
  if (data instanceof DocumentReference) {
    return ref(data.path)
  } else if (data instanceof Timestamp) {
    return data.toDate()
  } else if (data && typeof data === 'object') {
    const wrappedData = Object.assign(Array.isArray(data) ? [] : {}, data)
    Object.keys(wrappedData).forEach((key) => {
      wrappedData[key] = wrapData(wrappedData[key], ref)
    })
    return wrappedData
  } else {
    return data
  }
}
/**
 * Deeply replaces all `undefined` values in the data with `null`. It emulates
 * the Firestore behavior.
 *
 * @param data - the data to convert
 * @returns the data with undefined values replaced with null
 */
export function nullifyData(data) {
  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const newData = Array.isArray(data) ? [] : {}
    for (const key in data) {
      newData[key] = data[key] === undefined ? null : nullifyData(data[key])
    }
    return newData
  } else {
    return data
  }
}

export function assertEnvironment(environment) {
  if (environment && environment !== 'client')
    throw new Error(`Expected ${environment} environment`)
}

function request(payload) {
  return { type: 'request', ...payload }
}
