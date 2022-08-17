import * as firestore from '@google-cloud/firestore'
import * as admin from 'firebase-admin'
import type { Typesaurus } from '../..'
import type { TypesaurusQuery } from '../../types/query'
import { TypesaurusUtils } from '../../utils'

export function schema<Schema extends Typesaurus.PlainSchema>(
  getSchema: ($: Typesaurus.SchemaHelpers) => Schema
): Typesaurus.DB<Schema> {
  const schema = getSchema(schemaHelpers())
  return db(schema)
}

class RichCollection<Model> implements Typesaurus.RichCollection<Model> {
  type: 'collection' = 'collection'

  path: string

  constructor(path: string) {
    this.path = path
  }

  id(id?: string) {
    if (id) return id as unknown as Typesaurus.Id<Model>
    else return Promise.resolve(this.firebaseCollection().doc().id)
  }

  ref(id: string): Typesaurus.Ref<Model> {
    return new Ref<Model>(this, id)
  }

  doc<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    id: string,
    data: Model
  ): Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment> {
    return new Doc<Model>(
      this,
      id,
      nullifyData(data)
    ) as unknown as Typesaurus.EnvironmentDoc<
      Model,
      Source,
      DateStrategy,
      Environment
    >
  }

  add<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    data: Typesaurus.WriteModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    assertEnvironment(options?.as)
    return this.firebaseCollection()
      .add(writeData(data))
      .then((firebaseRef) => this.ref(firebaseRef.id))
  }

  set<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    id: string,
    data: Typesaurus.WriteModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    assertEnvironment(options?.as)
    return this.firebaseDoc(id)
      .set(writeData(data))
      .then(() => this.ref(id))
  }

  upset<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    id: string,
    data: Typesaurus.WriteModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    assertEnvironment(options?.as)
    return this.firebaseDoc(id)
      .set(writeData(data), { merge: true })
      .then(() => this.ref(id))
  }

  update<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    id: string,
    data: Typesaurus.UpdateModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    assertEnvironment(options?.as)

    const updateData = typeof data === 'function' ? data(updateHelpers()) : data

    const update = Array.isArray(updateData)
      ? updateData.reduce((acc, field) => {
          if (!field) return
          const { key, value } = field
          acc[Array.isArray(key) ? key.join('.') : key] = value
          return acc
        }, {} as Record<string, any>)
      : updateData

    return this.firebaseDoc(id)
      .update(unwrapData(update))
      .then(() => this.ref(id))
  }

  async remove(id: string) {
    await this.firebaseDoc(id).delete()
    return this.ref(id)
  }

  all<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(
    options?: Typesaurus.OperationOptions<Environment>
  ): Typesaurus.SubscriptionPromise<
    Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
    Typesaurus.SubscriptionListMeta<Model, Source, DateStrategy, Environment>
  > {
    assertEnvironment(options?.as)
    return all(this.adapter())
  }

  query<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(
    queries: TypesaurusQuery.QueryGetter<Model>,
    options?: Typesaurus.ReadOptions<DateStrategy, Environment>
  ): Typesaurus.SubscriptionPromise<
    Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
    Typesaurus.SubscriptionListMeta<Model, Source, DateStrategy, Environment>
  > {
    assertEnvironment(options?.as)
    return query(this.adapter(), queries)
  }

  get<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(
    id: string,
    options?: Typesaurus.ReadOptions<DateStrategy, Environment>
  ): Typesaurus.SubscriptionPromise<Typesaurus.EnvironmentDoc<
    Model,
    Source,
    DateStrategy,
    Environment
  > | null> {
    assertEnvironment(options?.as)

    const doc = this.firebaseDoc(id)

    return new TypesaurusUtils.SubscriptionPromise({
      get: async () => {
        const firebaseSnap = await doc.get()
        const data = firebaseSnap.data()
        if (data) return new Doc<Model>(this, id, wrapData(data))
        return null
      },

      subscribe: (onResult, onError) =>
        doc.onSnapshot((firebaseSnap) => {
          const data = firebaseSnap.data()
          if (data) onResult(new Doc<Model>(this, id, wrapData(data)))
          else onResult(null)
        }, onError)
    })
  }

  many<
    Source extends DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(
    ids: string[],
    options?: Typesaurus.ReadOptions<DateStrategy, Environment>
  ): TypesaurusUtils.SubscriptionPromise<
    Array<Typesaurus.EnvironmentDoc<
      ModelPair,
      Source,
      DateStrategy,
      Environment
    > | null>
  > {
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
          const data = firestoreData && (wrapData(firestoreData) as Model)
          return new Doc<Model>(this, firebaseSnap.id, data)
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

  private adapter<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(): CollectionAdapter<Model, Source, DateStrategy, Environment> {
    return {
      collection: () => this.firebaseCollection(),
      doc: (snapshot) =>
        new Doc<Model>(this, snapshot.id, wrapData(snapshot.data()))
    }
  }

  private firebaseCollection() {
    return admin.firestore().collection(this.path)
  }

  private firebaseDoc(id: string) {
    return admin.firestore().doc(`${this.path}/${id}`)
  }
}

class Ref<Model> implements Typesaurus.Ref<Model> {
  type: 'ref'

  collection: Typesaurus.RichCollection<Model>

  id: string

  constructor(collection: Typesaurus.RichCollection<Model>, id: string) {
    this.type = 'ref'
    this.collection = collection
    this.id = id
  }

  get<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(options?: Typesaurus.ReadOptions<DateStrategy, Environment>) {
    return this.collection.get<Source, DateStrategy, Environment>(
      this.id,
      options
    )
  }

  set<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    data: Typesaurus.WriteModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    return this.collection.set(this.id, data, options)
  }

  upset<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    data: Typesaurus.WriteModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    return this.collection.upset(this.id, data, options)
  }

  update<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    data: Typesaurus.UpdateModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    return this.collection.update(this.id, data, options)
  }

  async remove() {
    return this.collection.remove(this.id)
  }
}

class Doc<Model> implements Typesaurus.ServerDoc<Model> {
  type: 'doc'

  ref: Typesaurus.Ref<Model>

  collection: Typesaurus.RichCollection<Model>

  data: Typesaurus.ModelNodeData<Model>

  environment: 'server'

  constructor(
    collection: Typesaurus.RichCollection<Model>,
    id: string,
    data: Model
  ) {
    this.type = 'doc'
    this.collection = collection
    this.ref = new Ref<Model>(collection, id)
    this.data = data
    this.environment = 'server'
  }

  get<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(options?: Typesaurus.ReadOptions<DateStrategy, Environment>) {
    return this.ref.get<Source, DateStrategy, Environment>(options)
  }

  set<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    data: Typesaurus.WriteModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    return this.ref.set(data, options)
  }

  update<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    data: Typesaurus.UpdateModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    return this.ref.update(data, options)
  }

  upset<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  >(
    data: Typesaurus.WriteModelArg<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ) {
    return this.ref.upset(data, options)
  }

  remove() {
    return this.ref.remove()
  }
}

export interface CollectionAdapter<
  Model,
  Source extends Typesaurus.DataSource,
  DateStrategy extends Typesaurus.ServerDateStrategy,
  Environment extends Typesaurus.RuntimeEnvironment
> {
  collection: () => admin.firestore.Query
  doc: (
    snapshot: firestore.QueryDocumentSnapshot
  ) => Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>
}

export function all<
  Model,
  Source extends Typesaurus.DataSource,
  DateStrategy extends Typesaurus.ServerDateStrategy,
  Environment extends Typesaurus.RuntimeEnvironment
>(
  adapter: CollectionAdapter<Model, Source, DateStrategy, Environment>
): Typesaurus.SubscriptionPromise<
  Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
  Typesaurus.SubscriptionListMeta<Model, Source, DateStrategy, Environment>
> {
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

export function writeData<
  Model,
  Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
>(data: Typesaurus.WriteModelArg<Model, Environment>) {
  return unwrapData(typeof data === 'function' ? data(writeHelpers()) : data)
}

export function writeHelpers<Model>(): Typesaurus.WriteHelpers<Model> {
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

export function updateHelpers<Model>(): Typesaurus.UpdateHelpers<Model> {
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

function schemaHelpers(): Typesaurus.SchemaHelpers {
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

function db(
  schema: Typesaurus.PlainSchema,
  nestedPath?: string
): Typesaurus.AnyDB {
  return Object.entries(schema).reduce<Typesaurus.AnyDB>(
    (enrichedSchema, [path, plainCollection]) => {
      const collection = new RichCollection(
        nestedPath ? `${nestedPath}/${path}` : path
      )

      enrichedSchema[path] =
        'schema' in plainCollection
          ? new Proxy<Typesaurus.NestedRichCollection<any, any>>(() => {}, {
              get: (_target, prop: 'schema' | keyof typeof collection) => {
                if (prop === 'schema') return plainCollection.schema
                else return collection[prop]
              },

              has(_target, prop) {
                return prop in plainCollection
              },

              apply: (_target, prop, [id]: [string]) =>
                db(plainCollection.schema, `${collection.path}/${id}`)
            })
          : collection

      return enrichedSchema
    },
    {}
  )
}

export function query<
  Model,
  Source extends Typesaurus.DataSource,
  DateStrategy extends Typesaurus.ServerDateStrategy,
  Environment extends Typesaurus.RuntimeEnvironment
>(
  adapter: CollectionAdapter<Model, Source, DateStrategy, Environment>,
  queries: TypesaurusQuery.QueryGetter<Model>
): Typesaurus.SubscriptionPromise<
  Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
  Typesaurus.SubscriptionListMeta<Model, Source, DateStrategy, Environment>
> {
  const resolvedQueries = ([] as TypesaurusQuery.Query<Model>[]).concat(
    queries(queryHelpers())
  )
  // Query accumulator, will contain final Firestore query with all the
  // filters and limits.
  let firestoreQuery: admin.firestore.Query = adapter.collection()

  let cursors: TypesaurusQuery.OrderCursor<any, any, any>[] = []

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

  let groupedCursors: [TypesaurusQuery.OrderCursorPosition, any[]][] = []

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

function queryHelpers<Model>(): TypesaurusQuery.QueryHelpers<Model> {
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

    limit: (number) => ({
      type: 'limit',
      number
    }),

    startAt: (value) => ({
      type: 'cursor',
      position: 'startAt',
      value
    }),

    startAfter: (value) => ({
      type: 'cursor',
      position: 'startAfter',
      value
    }),

    endAt: (value) => ({
      type: 'cursor',
      position: 'endAt',
      value
    }),

    endBefore: (value) => ({
      type: 'cursor',
      position: 'endBefore',
      value
    }),

    docId: () => '__id__'
  }
}

/**
 * Generates Firestore path from a reference.
 *
 * @param ref - The reference to a document
 * @returns Firestore path
 */
export function getRefPath<Model>(ref: Typesaurus.Ref<Model>) {
  return [ref.collection.path].concat(ref.id).join('/')
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument<Model>(ref: Typesaurus.Ref<Model>) {
  return admin.firestore().doc(getRefPath(ref))
}

/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
export function pathToRef<Model>(path: string): Typesaurus.Ref<Model> {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return new Ref<Model>(new RichCollection<Model>(collectionPath), id)
}

export function pathToDoc<Model>(
  path: string,
  data: Model
): Typesaurus.Doc<Model> {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return new Doc<Model>(new RichCollection<Model>(collectionPath), id, data)
}

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Firestore format
 */
export function unwrapData(data: any): any {
  if (data && typeof data === 'object') {
    if (data.type === 'ref') {
      return refToFirestoreDocument(data as Typesaurus.Ref<unknown>)
    } else if (data.type === 'value') {
      const fieldValue = data as Typesaurus.Value<any>
      switch (fieldValue.kind) {
        case 'remove':
          return firestore.FieldValue.delete()
        case 'increment':
          return firestore.FieldValue.increment(fieldValue.number)
        case 'arrayUnion':
          return firestore.FieldValue.arrayUnion(
            ...unwrapData(fieldValue.values)
          )
        case 'arrayRemove':
          return firestore.FieldValue.arrayRemove(
            ...unwrapData(fieldValue.values)
          )
        case 'serverDate':
          return firestore.FieldValue.serverTimestamp()
      }
    } else if (data instanceof Date) {
      return firestore.Timestamp.fromDate(data)
    }

    const unwrappedObject: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data
    )
    Object.keys(unwrappedObject).forEach((key) => {
      unwrappedObject[key] = unwrapData(unwrappedObject[key])
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
export function wrapData(data: any): any {
  if (data instanceof firestore.DocumentReference) {
    return pathToRef(data.path)
  } else if (data instanceof firestore.Timestamp) {
    return data.toDate()
  } else if (data && typeof data === 'object') {
    const wrappedData: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data
    )
    Object.keys(wrappedData).forEach((key) => {
      wrappedData[key] = wrapData(wrappedData[key])
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
export function nullifyData(data: any): any {
  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const newData: typeof data = Array.isArray(data) ? [] : {}
    for (const key in data) {
      newData[key] = data[key] === undefined ? null : nullifyData(data[key])
    }
    return newData
  } else {
    return data
  }
}

export function assertEnvironment<
  Environment extends Typesaurus.RuntimeEnvironment
>(
  environment: Typesaurus.RuntimeEnvironment | undefined
): asserts environment is undefined | Environment {
  if (environment && environment !== 'server')
    throw new Error(`Expected ${environment} environment`)
}
