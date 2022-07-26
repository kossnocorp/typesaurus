import * as firestore from '@google-cloud/firestore'
import * as admin from 'firebase-admin'
import { Typesaurus } from '../..'
import { TypesaurusUtils } from '../../utils'

export function schema<Schema extends Typesaurus.PlainSchema>(
  getSchema: ($: Typesaurus.SchemaHelpers) => Schema
): Typesaurus.RootDB<Schema> {
  const schemaHelpers: Typesaurus.SchemaHelpers = {
    collection() {
      return { type: 'collection' }
    },

    sub(collection, schema) {
      return { ...collection, schema }
    }
  }

  const db = getSchema(schemaHelpers)

  const richdb: Typesaurus.RichSchema = {}

  Object.entries(db).forEach(([collectionPath, collection]) => {
    richdb[collectionPath] = new RichCollection(collectionPath)
  })

  return richdb as unknown as Typesaurus.RootDB<Schema>
}

class RichCollection<Model> implements Typesaurus.RichCollection<Model> {
  path: string

  constructor(path: string) {
    this.path = path
  }

  ref(id: string) {
    return new Ref<Model>(this, id)
  }

  doc(id: string, data: Model) {
    return new Doc<Model>(this, id, data)
  }

  async add<Environment extends Typesaurus.RuntimeEnvironment>(
    getData: Typesaurus.WriteModelArg<Model, Environment>
  ) {
    const data =
      typeof getData === 'function' ? getData(this.writeHelpers()) : getData
    const firebaseRef = await this.firebaseCollection().add(unwrapData(data))
    return this.ref(firebaseRef.id)
  }

  all(): Typesaurus.PromiseWithListSubscription<Model> {
    const firebaseCollection = admin.firestore().collection(this.path)

    return new TypesaurusUtils.SubscriptionPromise<Typesaurus.Doc<Model>[]>({
      get: async () => {
        const snapshot = await this.firebaseCollection().get()
        return snapshot.docs.map(
          (doc) => new Doc<Model>(this, doc.id, wrapData(doc.data()))
        )
      },

      subscribe: (onResult, onError) =>
        firebaseCollection.onSnapshot((snapshot) => {
          onResult(
            snapshot.docs.map(
              (doc) => new Doc<Model>(this, doc.id, wrapData(doc.data()))
            )
          )
        }, onError)
    })
    // return firebaseSnap.docs.map(
    //   (doc) => new RichDoc(this, doc.id, wrapData(doc.data()))
    // )
  }

  get(id: string) {
    return new TypesaurusUtils.SubscriptionPromise({
      get: async () => {
        const firebaseSnap = await this.firebaseDoc(id).get()
        const data = firebaseSnap.data()
        if (data) return this.doc(id, wrapData(firebaseSnap.data()))
        return null
      },

      subscribe() {}
    })
  }

  getMany() {}

  query() {}

  set<Environment extends Typesaurus.RuntimeEnvironment>(
    id: string,
    data: Typesaurus.WriteModel<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ): Promise<void>

  set<Environment extends Typesaurus.RuntimeEnvironment>(
    id: string,
    data: (
      $: Typesaurus.WriteHelpers<Model>
    ) => Typesaurus.WriteModel<Model, Environment>,
    options?: Typesaurus.OperationOptions<Environment>
  ): Promise<void>

  async set<Environment extends Typesaurus.RuntimeEnvironment>(
    id: string,
    data:
      | Typesaurus.WriteModel<Model, Environment>
      | ((
          $: Typesaurus.WriteHelpers<Model>
        ) => Typesaurus.WriteModel<Model, Environment>)
  ) {
    await this.firebaseDoc(id).set(unwrapData(data))
  }

  async remove(id: string) {
    await this.firebaseDoc(id).delete()
  }

  private writeHelpers(): Typesaurus.WriteHelpers<Model> {
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

  set() {}

  get() {
    return this.collection.get(this.id)
  }

  update() {}

  upset() {}

  async remove() {
    await this.collection.remove(this.id)
  }

  private firebaseDoc() {
    return admin.firestore().doc(`${this.collection.path}/${this.id}`)
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

  get() {
    return this.ref.get()
  }

  update(update) {
    return this.ref.update(update)
  }

  upset() {}

  async remove() {
    await this.ref.remove()
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
      const fieldValue = data as Typesaurus.UpdateValue<any, any>
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
