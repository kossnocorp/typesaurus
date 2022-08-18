// import * as firestore from '@google-cloud/firestore'
// import * as admin from 'firebase-admin'
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
  deleteField
} from 'firebase/firestore'
import { TypesaurusUtils } from '../../utils'

// export { batch } from './batch'

// export { transaction } from './transaction'

// export { groups } from './groups'

export function schema(getSchema) {
  const schema = getSchema(schemaHelpers())
  return db(schema)
}

class RichCollection {
  constructor(path) {
    this.type = 'collection'
    this.path = path
    this.firebaseDB = getFirestore()
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
    return this.firebaseDoc(id)
      .set(writeData(data))
      .then(() => this.ref(id))
  }

  upset(id, data, options) {
    assertEnvironment(options?.as)
    return this.firebaseDoc(id)
      .set(writeData(data), { merge: true })
      .then(() => this.ref(id))
  }

  update(id, data, options) {
    assertEnvironment(options?.as)
    const updateData = typeof data === 'function' ? data(updateHelpers()) : data
    const update = Array.isArray(updateData)
      ? updateData.reduce((acc, field) => {
          if (!field) return
          const { key, value } = field
          acc[Array.isArray(key) ? key.join('.') : key] = value
          return acc
        }, {})
      : updateData

    return this.firebaseDoc(id)
      .update(unwrapData(update))
      .then(() => this.ref(id))
  }

  async remove(id) {
    await this.firebaseDoc(id).delete()
    return this.ref(id)
  }

  all(options) {
    assertEnvironment(options?.as)
    return all(this.adapter())
  }

  query(queries, options) {
    assertEnvironment(options?.as)
    return query(this.adapter(), queries)
  }

  get(id, options) {
    assertEnvironment(options?.as)
    const doc = this.firebaseDoc(id)

    return new TypesaurusUtils.SubscriptionPromise({
      get: async () => {
        const firebaseSnap = await getDoc(doc)
        const data = firebaseSnap.data()
        if (data) return new Doc(this, id, wrapData(data))
        return null
      },

      subscribe: (onResult, onError) =>
        doc.onSnapshot((firebaseSnap) => {
          const data = firebaseSnap.data()
          if (data) onResult(new Doc(this, id, wrapData(data)))
          else onResult(null)
        }, onError)
    })
  }

  many(ids, options) {
    assertEnvironment(options?.as)

    return new TypesaurusUtils.SubscriptionPromise({
      get: async () => {
        // Firestore#getAll doesn't like empty lists
        if (ids.length === 0) return Promise.resolve([])
        const firebaseSnap = await admin
          .firestore()
          .getAll(...ids.map((id) => this.firebaseDoc(id)))
        return firebaseSnap.map((firebaseSnap) => {
          if (!firebaseSnap.exists) {
            return null
          }
          const firestoreData = firebaseSnap.data()
          const data = firestoreData && wrapData(firestoreData)
          return new Doc(this, firebaseSnap.id, data)
        })
      },

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
      collection: () => this.firebaseCollection(),
      doc: (snapshot) => new Doc(this, snapshot.id, wrapData(snapshot.data()))
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

  update(data, options) {
    return this.collection.update(this.id, data, options)
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
    this.environment = 'server'
  }

  get(options) {
    return this.ref.get(options)
  }

  set(data, options) {
    return this.ref.set(data, options)
  }

  update(data, options) {
    return this.ref.update(data, options)
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
    get: async () => {
      const snapshot = await firebaseCollection.get()
      return snapshot.docs.map((doc) => adapter.doc(doc))
    },

    subscribe: (onResult, onError) =>
      firebaseCollection.onSnapshot((firebaseSnap) => {
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
      }, onError)
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

export function updateHelpers() {
  return {
    ...writeHelpers(),
    field: (...field) => ({
      set: (value) => ({
        key: field,
        value
      })
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

export function query(adapter, queries) {
  const resolvedQueries = [].concat(queries(queryHelpers()))
  // Query accumulator, will contain final Firestore query with all the
  // filters and limits.
  let firestoreQuery = adapter.collection()
  let cursors = []

  resolvedQueries.forEach((query) => {
    switch (query.type) {
      case 'order': {
        const { field, method, cursors: queryCursors } = query
        firestoreQuery = firestoreQuery.orderBy(
          field[0] === '__id__'
            ? admin.firestore.FieldPath.documentId()
            : field.join('.'),
          method
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
        firestoreQuery = firestoreQuery.where(
          field[0] === '__id__'
            ? admin.firestore.FieldPath.documentId()
            : field.join('.'),
          filter,
          unwrapData(value)
        )
        break
      }
      case 'limit': {
        const { number } = query
        firestoreQuery = firestoreQuery.limit(number)
        break
      }
    }
  })

  let groupedCursors = []

  cursors.forEach((cursor) => {
    let methodValues = groupedCursors.find(
      ([position]) => position === cursor.position
    )
    if (!methodValues) {
      methodValues = [cursor.position, []]
      groupedCursors.push(methodValues)
    }
    methodValues[1].push(unwrapData(cursor.value))
  })

  if (cursors.length && cursors.every((cursor) => cursor.value !== undefined))
    groupedCursors.forEach(([method, values]) => {
      firestoreQuery = firestoreQuery[method](...values)
    })

  return new TypesaurusUtils.SubscriptionPromise({
    get: async () => {
      const firebaseSnap = await firestoreQuery.get()
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

    subscribe: (onResult, onError) =>
      firestoreQuery.onSnapshot((firebaseSnap) => {
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
      }, onError)
  })
}

function queryHelpers() {
  function where(field, filter, value) {
    return {
      type: 'where',
      field,
      filter,
      value
    }
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

      order: (...args) => ({
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

    limit: (number) => ({ type: 'limit', number }),

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
