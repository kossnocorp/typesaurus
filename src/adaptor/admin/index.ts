import { Typesaurus } from '../..'
import * as firestore from '@google-cloud/firestore'
import * as admin from 'firebase-admin'

export function schema<Schema extends Typesaurus.PlainSchema>(
  getSchema: ($: Typesaurus.SchemaHelpers) => Schema
): Typesaurus.RootDB<
  Schema,
  firestore.WhereFilterOp,
  firestore.OrderByDirection
> {
  const schemaHelpers: Typesaurus.SchemaHelpers = {
    collection() {
      return { __type__: 'collection' }
    },

    sub(collection, schema) {
      return { ...collection, schema }
    }
  }

  const db = getSchema(schemaHelpers)

  const richdb: Typesaurus.RichSchema<
    firestore.WhereFilterOp,
    firestore.OrderByDirection
  > = {}

  Object.entries(db).forEach(([collectionPath, collection]) => {
    const firebaseCollection = () =>
      admin.firestore().collection(collectionPath)
    const firebaseDoc = (id: string) => firebaseCollection().doc(id)

    const typesaurusDoc: (
      id: string,
      data: unknown
    ) => Typesaurus.RichDoc<unknown> = (id, data) => ({
      type: 'doc',
      ref: {
        collection: collectionPath,
        id
      },
      data,
      environment: 'web',
      fromCache: false,
      hasPendingWrites: false,
      serverTimestamps: 'estimate',
      firestoreData: false
    })

    richdb[collectionPath] = {
      ...collection,

      get(id) {
        const doc = admin.firestore().doc(`${collectionPath}/${id}`)

        function createResult(
          snapshot: firestore.DocumentSnapshot
        ): Typesaurus.RichDoc<unknown> | null {
          const data = snapshot.data()
          if (data) return { data } as Typesaurus.RichDoc<unknown>
          return null
        }

        const promise: Typesaurus.PromiseWithGetSubscription<unknown> = {
          on(resultCallback) {
            let errorCallback: Typesaurus.SubscriptionErrorCallback = () => {}

            const off = doc.onSnapshot(
              (snapshot) => resultCallback(createResult(snapshot)),
              (error) => errorCallback(error)
            ) as Typesaurus.OffSubscriptionWithCatch

            off.catch = (cb) => {
              errorCallback = cb
              return off
            }

            return off as Typesaurus.OffSubscriptionWithCatch
          },

          async then(resultCallback) {
            return resultCallback?.(createResult(await doc.get()))
          },

          async catch(cb) {
            return this.then().catch(cb)
          }
        }

        return promise
      },

      getMany() {},

      async all() {
        const firebaseSnap = await firebaseCollection().get()
        return firebaseSnap.docs.map((doc) =>
          typesaurusDoc(doc.id, wrapData(doc.data()))
        )
      },

      async set(id, data) {
        await firebaseDoc(id).set(unwrapData(data))
      },

      async remove(id) {
        await firebaseDoc(id).delete()
      },

      ref(id) {
        return typesaurusRef(id)
      }
    }
  })

  return richdb as unknown as Typesaurus.RootDB<
    Schema,
    firestore.WhereFilterOp,
    firestore.OrderByDirection
  >
}

type SubscriptionPromiseGet<Result> = () => Promise<Result>

type SubscriptionPromiseSubscribe<Result> = (
  resultCallback: (result: Result) => void
) => Typesaurus.OffSubscription

interface SubscriptionPromiseProps<Result> {
  get: SubscriptionPromiseGet<Result>
  subscribe: SubscriptionPromiseSubscribe<Result>
}

class SubscriptionPromise<Result>
  implements Typesaurus.SubscriptionPromise<Result>
{
  private result: Result | undefined

  private get: SubscriptionPromiseGet<Result>

  private subscribe: SubscriptionPromiseSubscribe<Result>

  constructor({ get, subscribe }: SubscriptionPromiseProps<Result>) {
    this.get = get
    this.subscribe = subscribe
  }

  get [Symbol.toStringTag]() {
    return '[object SubscriptionPromise]'
  }

  async then<FullfillResult = Result, RejectResult = never>(
    onFulfilled?:
      | ((value: Result) => FullfillResult | PromiseLike<FullfillResult>)
      | undefined
      | null,
    onRejected?:
      | ((reason: any) => RejectResult | PromiseLike<RejectResult>)
      | undefined
      | null
  ): Promise<FullfillResult | RejectResult> {
    return this.get()
      .then((result) => {
        this.result = result
        if (onFulfilled) return onFulfilled(result)
        return result
      })
      .catch(onRejected)
  }

  catch<CatchResult = never>(
    onrejected?:
      | ((reason: any) => CatchResult | PromiseLike<CatchResult>)
      | undefined
      | null
  ): Promise<Result | CatchResult> {
    return {} as unknown as Promise<Result>
  }

  finally(onFinally?: (() => void) | null | undefined): Promise<Result> {
    return {} as unknown as Promise<Result>
  }

  on(
    callback: Typesaurus.SubscriptionPromiseCallback<Result>
  ): Typesaurus.OffSubscriptionWithCatch {
    // this.subscribe((result) => callback(result))
    return {} as unknown as Typesaurus.OffSubscriptionWithCatch
  }
}

class RichCollection<Model>
  implements
    Typesaurus.RichCollection<
      Model,
      firestore.WhereFilterOp,
      firestore.OrderByDirection
    >
{
  path: string

  constructor(path: string) {
    this.path = path
  }

  all(): Typesaurus.PromiseWithListSubscription<Model> {
    const firebaseCollection = admin.firestore().collection(this.path)
    const collection = this

    return new SubscriptionPromise<Typesaurus.RichDoc<Model>[]>({
      get() {},

      subscribe: (callback) => {
        firebaseCollection.onSnapshot((snapshot) => {
          callback(
            snapshot.docs.map(
              (doc) =>
                new RichDoc<Model>(collection, doc.id, wrapData(doc.data()))
            )
          )
        })
      }
    })
    // return firebaseSnap.docs.map(
    //   (doc) => new RichDoc(this, doc.id, wrapData(doc.data()))
    // )
  }

  get() {}

  getMany() {}

  query() {}

  add() {}

  async remove(id: string) {
    await this.firebaseDoc(id).delete()
  }

  private firebaseDoc(id: string) {
    return admin.firestore().doc(`${this.path}/${id}`)
  }
}
class RichRef<Model>
  implements
    Typesaurus.RichRef<
      Model,
      firestore.WhereFilterOp,
      firestore.OrderByDirection
    >
{
  type: 'ref'

  collection: Typesaurus.RichCollection<
    Model,
    firestore.WhereFilterOp,
    firestore.OrderByDirection
  >

  id: string

  constructor(
    collection: Typesaurus.RichCollection<
      Model,
      firestore.WhereFilterOp,
      firestore.OrderByDirection
    >,
    id: string
  ) {
    this.type = 'ref'
    this.collection = collection
    this.id = id
  }

  set() {}

  update() {}

  upset() {}

  async remove() {
    await this.collection.remove(this.id)
  }

  private firebaseDoc() {
    return admin.firestore().doc(`${this.collection.path}/${this.id}`)
  }
}

class RichDoc<Model> implements Typesaurus.RichServerDoc<Model> {
  type: 'doc'

  ref: Typesaurus.RichRef<
    Model,
    firestore.WhereFilterOp,
    firestore.OrderByDirection
  >

  collection: Typesaurus.RichCollection<
    Model,
    firestore.WhereFilterOp,
    firestore.OrderByDirection
  >

  data: Typesaurus.ModelNodeData<Model>

  environment: 'server'

  constructor(
    collection: Typesaurus.RichCollection<
      Model,
      firestore.WhereFilterOp,
      firestore.OrderByDirection
    >,
    id: string,
    data: Model
  ) {
    this.type = 'doc'
    this.collection = collection
    this.ref = new RichRef<Model>(collection, id)
    this.data = data
    this.environment = 'server'
  }

  update(update) {
    this.ref.update(update)
  }

  upset() {}

  async remove() {
    await this.ref.remove()
  }
}

// /**
//  *
//  * @param api - the doc API
//  * @param collection
//  * @param id
//  * @returns
//  */
// function ref<Model>(
//   api: Typesaurus.DocAPI<Model>,
//   collection: Typesaurus.RichCollection<
//     Model,
//     firestore.WhereFilterOp,
//     firestore.OrderByDirection
//   >,
//   id: string
// ): Typesaurus.RichRef<Model> {
//   return {
//     type: 'ref',
//     collection,
//     id,
//     ...api
//   }
// }

/**
 * Generates Firestore path from a reference.
 *
 * @param ref - The reference to a document
 * @returns Firestore path
 */
export function getRefPath(ref: Typesaurus.PlainRef<unknown>) {
  return [ref.collection.path].concat(ref.id).join('/')
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument<Model>(ref: Typesaurus.PlainRef<Model>) {
  return admin.firestore().doc(getRefPath(ref))
}

/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
export function pathToRef<Model>(path: string): Typesaurus.PlainRef<Model> {
  const captures = path.match(/^(.+)\/(.+)$/)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, collectionPath, id] = captures
  return {
    type: 'ref',
    collection: { __type__: 'collection', path: collectionPath },
    id
  }
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
      return refToFirestoreDocument(data as Typesaurus.PlainRef<unknown>)
    } else if (data.__type__ === 'value') {
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
