import {
  getFirestore,
  Timestamp,
  FieldValue,
  FieldPath,
  DocumentReference
} from 'firebase-admin/firestore'
import { SubscriptionPromise } from '../../sp/index.ts'

export function schema(getSchema) {
  const schema = getSchema(schemaHelpers())
  return db(schema)
}

export class Collection {
  constructor(name, path) {
    this.type = 'collection'
    this.name = name
    this.path = path

    this.update = (id, data, options) => {
      assertEnvironment(options?.as)
      const updateData =
        typeof data === 'function' ? data(updateHelpers()) : data
      if (!updateData) return

      const update = Array.isArray(updateData)
        ? updateFields(updateData)
        : updateData instanceof UpdateField
        ? updateFields([updateData])
        : updateData

      return (
        Object.keys(update).length
          ? this.firebaseDoc(id).update(unwrapData(update, true))
          : Promise.resolve()
      ).then(() => this.ref(id))
    }

    this.update.build = (id, options) => {
      assertEnvironment(options?.as)
      const fields = []
      return {
        ...updateHelpers('build', fields),
        run: async () => {
          if (fields.length)
            await this.firebaseDoc(id).update(
              unwrapData(updateFields(fields), true)
            )
          return this.ref(id)
        }
      }
    }

    this.query = (queries, options) => {
      assertEnvironment(options?.as)
      const queriesResult = queries(queryHelpers())
      if (!queriesResult) return
      return query(
        this.adapter(),
        [].concat(queriesResult).filter((q) => !!q)
      )
    }

    this.query.build = (options) => {
      assertEnvironment(options?.as)
      const queries = []
      return {
        ...queryHelpers('builder', queries),
        run: () => query(this.adapter(), queries)
      }
    }
  }

  id(id) {
    if (id) return id
    else return Promise.resolve(this.firebaseCollection().doc().id)
  }

  ref(id) {
    return new Ref(this, id)
  }

  doc(id, value, options) {
    if (!value && 'id' in id && 'data' in id && typeof id.data === 'function') {
      if (id.exists) return this.doc(id.id, wrapData(id.data()))
      else return null
    } else {
      assertEnvironment(options?.as)
      return new Doc(this, id, value)
    }
  }

  add(data, options) {
    assertEnvironment(options?.as)
    return this.firebaseCollection()
      .add(writeData(data))
      .then((firebaseRef) => this.ref(firebaseRef.id))
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

  async remove(id) {
    await this.firebaseDoc(id).delete()
    return this.ref(id)
  }

  all(options) {
    assertEnvironment(options?.as)
    return all(this.adapter())
  }

  get(id, options) {
    assertEnvironment(options?.as)
    const doc = this.firebaseDoc(id)

    return new SubscriptionPromise({
      request: request({ kind: 'get', path: this.path, id }),

      get: async () => {
        const firebaseSnap = await doc.get()
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

    return new SubscriptionPromise({
      request: request({ kind: 'many', path: this.path, ids }),

      get: async () => {
        // Firestore#getAll doesn't like empty lists
        if (ids.length === 0) return Promise.resolve([])
        const firebaseSnap = await getFirestore().getAll(
          ...ids.map((id) => this.firebaseDoc(id))
        )
        return firebaseSnap.map((firebaseSnap) => {
          if (!firebaseSnap.exists) return null
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
      doc: (snapshot) => new Doc(this, snapshot.id, wrapData(snapshot.data())),
      request: () => ({ path: this.path })
    }
  }

  firebaseCollection() {
    return getFirestore().collection(this.path)
  }

  firebaseDoc(id) {
    return getFirestore().doc(`${this.path}/${id}`)
  }
}

export class Ref {
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

  buildUpdate(data, options) {
    return this.collection.buildUpdate(this.id, data, options)
  }

  async remove() {
    return this.collection.remove(this.id)
  }
}

export class Doc {
  constructor(collection, id, data) {
    this.type = 'doc'
    this.collection = collection
    this.ref = new Ref(collection, id)
    this.data = data
    this.props = {
      environment: 'server',
      source: 'database',
      dateStrategy: 'none',
      pendingWrites: false
    }

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

  test(props) {
    return Object.entries(props).every(
      ([key, value]) => this.props[key] === value
    )
  }

  narrow(cb) {
    const result = cb(this.data)
    if (result) return this
  }
}

export function all(adapter) {
  const firebaseCollection = adapter.collection()

  return new SubscriptionPromise({
    request: request({ kind: 'all', ...adapter.request() }),

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

export function writeData(data) {
  return unwrapData(typeof data === 'function' ? data(writeHelpers()) : data)
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
    if (!field) return acc
    const { key, value } = field
    acc[Array.isArray(key) ? key.join('.') : key] = value
    return acc
  }, {})
}

class UpdateField {
  constructor(key, value) {
    this.key = key
    this.value = value
  }
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
      set: (value) => processField(new UpdateField(field, value))
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
        },
        name(name) {
          return {
            type: 'collection',
            name,
            sub(schema) {
              return { type: 'collection', schema }
            }
          }
        }
      }
    }
  }
}

function db(schema, nestedPath) {
  return Object.entries(schema).reduce(
    (enrichedSchema, [collectionName, plainCollection]) => {
      const name =
        typeof plainCollection.name === 'string'
          ? plainCollection.name
          : collectionName
      const collection = new Collection(
        name,
        nestedPath ? `${nestedPath}/${name}` : name
      )

      if ('schema' in plainCollection) {
        enrichedSchema[collectionName] = new Proxy(() => {}, {
          get: (_target, prop) => {
            if (prop === 'schema') return plainCollection.schema
            else if (prop === 'sub') return subShortcut(plainCollection.schema)
            else return collection[prop]
          },
          has(_target, prop) {
            return prop in plainCollection
          },
          apply: (_target, _prop, [id]) =>
            db(plainCollection.schema, `${collection.path}/${id}`)
        })
      } else {
        enrichedSchema[collectionName] = collection
      }

      return enrichedSchema
    },
    {}
  )
}

function subShortcut(schema) {
  return Object.entries(schema).reduce(
    (shortcutsSchema, [path, schemaCollection]) => {
      shortcutsSchema[path] = {
        id(id) {
          if (id) return id
          else return Promise.resolve(getFirestore().collection('any').doc().id)
        }
      }

      if ('schema' in schemaCollection)
        shortcutsSchema[path].sub = subShortcut(schemaCollection.schema)

      return shortcutsSchema
    },
    {}
  )
}

export function query(adapter, queries) {
  // Query accumulator, will contain final Firestore query with all the
  // filters and limits.
  let firestoreQuery = adapter.collection()
  let cursors = []

  queries.forEach((query) => {
    switch (query.type) {
      case 'order': {
        const { field, method, cursors: queryCursors } = query
        firestoreQuery = firestoreQuery.orderBy(
          field[0] === '__id__' ? FieldPath.documentId() : field.join('.'),
          method
        )

        if (queryCursors)
          cursors = cursors.concat(
            queryCursors.reduce((acc, cursor) => {
              if (!cursor) return acc
              const { type, position, value } = cursor
              return acc.concat({
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
              })
            }, [])
          )
        break
      }

      case 'where': {
        const { field, filter, value } = query
        firestoreQuery = firestoreQuery.where(
          field[0] === '__id__' ? FieldPath.documentId() : field.join('.'),
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

  return new SubscriptionPromise({
    request: request({
      kind: 'query',
      ...adapter.request(),
      queries: queries
    }),

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

      order: (maybeMethod, maybeCursors) =>
        processQuery({
          type: 'order',
          field,
          method: typeof maybeMethod === 'string' ? maybeMethod : 'asc',
          cursors: maybeCursors
            ? [].concat(maybeCursors)
            : maybeMethod && typeof maybeMethod !== 'string'
            ? [].concat(maybeMethod)
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
 * Generates Firestore path from a reference.
 *
 * @param ref - The reference to a document
 * @returns Firestore path
 */
export function getRefPath(ref) {
  return [ref.collection.path].concat(ref.id).join('/')
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument(ref) {
  return getFirestore().doc(getRefPath(ref))
}

export const pathRegExp = /^(?:(.+\/)?(.+))\/(.+)$/

/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
export function pathToRef(path) {
  const captures = path.match(pathRegExp)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, nestedPath, name, id] = captures
  return new Ref(new Collection(name, (nestedPath || '') + name), id)
}

export function pathToDoc(path, data) {
  const captures = path.match(pathRegExp)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, nestedPath, name, id] = captures
  return new Doc(new Collection(name, (nestedPath || '') + name), id, data)
}

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Firestore format
 */
export function unwrapData(data) {
  if (data && typeof data === 'object') {
    if (data.type === 'ref') {
      return refToFirestoreDocument(data)
    } else if (data.type === 'value') {
      const fieldValue = data
      switch (fieldValue.kind) {
        case 'remove':
          return FieldValue.delete()

        case 'increment':
          return FieldValue.increment(fieldValue.number)

        case 'arrayUnion':
          return FieldValue.arrayUnion(...unwrapData(fieldValue.values))

        case 'arrayRemove':
          return FieldValue.arrayRemove(...unwrapData(fieldValue.values))

        case 'serverDate':
          return FieldValue.serverTimestamp()
      }
    } else if (data instanceof Date) {
      return Timestamp.fromDate(data)
    }

    const isArray = Array.isArray(data)
    const unwrappedObject = Object.assign(isArray ? [] : {}, data)

    Object.keys(unwrappedObject).forEach((key) => {
      unwrappedObject[key] = unwrapData(unwrappedObject[key])
    })

    return unwrappedObject
  } else if (data === undefined) {
    return '%%undefined%%'
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
  } else if (typeof data === 'string' && data === '%%undefined%%') {
    return undefined
  } else {
    return data
  }
}

export function assertEnvironment(environment) {
  if (environment && environment !== 'server')
    throw new Error(`Expected ${environment} environment`)
}

function request(payload) {
  return { type: 'request', ...payload }
}
