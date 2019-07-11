import store, {
  FirebaseWriteBatch,
  FirestoreCollectionReference,
  FirestoreDocumentReference,
  FirestoreFieldValue,
  FirestoreOrderByDirection,
  FirestoreQuery,
  FirestoreTransaction,
  FirestoreWhereFilterOp
} from '../adaptor'

export interface Imprint<Model> {
  id: string
  data: Model
}

export type ModelUpdate<Model> = {
  [Key in keyof Model]?: Model[Key] | Value<Model[Key]>
}

// export type ModelSet<Model> = {
//   [Key in keyof Model]: Model[Key] | Value<Model[Key]>
// }

export class Document<Model> {
  ref: Ref<Model>
  data: Model

  constructor(ref: Ref<Model>, data: Model) {
    this.ref = ref
    this.data = wrapData(data) as Model
  }

  imprint(): Imprint<Model> {
    return {
      id: refToDoc(this.ref).id,
      data: this.data
    }
  }
}

export class Collection<Model> {
  name: string
  collection: FirestoreCollectionReference

  constructor(name: string) {
    this.name = name
    this.collection = store.collection(name)
  }

  doc(docId?: string) {
    if (docId) {
      return this.collection.doc(docId)
    } else {
      return this.collection.doc()
    }
  }

  ref(docId?: string) {
    return buildRef<Model>(this.doc(docId).path)
  }

  get(docId: string) {
    return getRef(this.ref(docId))
  }

  subGet(
    docId: string,
    onValue: (document: Document<Model> | null) => void,
    onError: (error: any) => void
  ) {
    return subRef(this.ref(docId), onValue, onError)
  }

  all() {
    return this.collection.get().then(snap => {
      return snap.docs.map(docSnap => {
        const ref = buildRef<Model>(docSnap.ref.path)
        const data = docSnap.data() as Model
        return new Document<Model>(ref, data)
      })
    })
  }

  subAll(
    onValue: (values: Document<Model>[]) => void,
    onError: (err: any) => void
  ) {
    const unsub = this.collection.onSnapshot(
      querySnap =>
        onValue(
          querySnap.docs.map(docSnap => {
            const ref = buildRef<Model>(docSnap.ref.path)
            const data = docSnap.data() as Model
            return new Document<Model>(ref, data)
          })
        ),
      onError
    )
    return unsub
  }

  where(
    // TODO: Figure out how to allow any string and autocomplete in the same time
    key: keyof Model | string,
    filter: FirestoreWhereFilterOp,
    value: any
  ): Query<Model> {
    const query = new Query<Model>(this)
    return query.where(key, filter, value)
  }

  orderBy(
    key: keyof Model | string,
    method?: FirestoreOrderByDirection
  ): Query<Model> {
    const query = new Query<Model>(this)
    return query.orderBy(key, method)
  }

  subWhere(
    // TODO: Figure out how to allow any string and autocomplete in the same time
    key: keyof Model | string,
    filter: FirestoreWhereFilterOp,
    value: any,
    onValue: (values: Document<Model>[]) => void,
    onError: (err: any) => void
  ) {
    const unsub = this.collection
      .where(key as string, filter, unwrapValue(value))
      .onSnapshot(
        querySnap =>
          onValue(
            querySnap.docs.map(docSnap => {
              const ref = buildRef<Model>(docSnap.ref.path)
              const data = docSnap.data() as Model
              return new Document<Model>(ref, data)
            })
          ),
        onError
      )
    return unsub
  }

  update(docId: string, payload: { [Key in keyof Model]?: Model[Key] }) {
    return this.doc(docId).update(unwrapValue(payload))
  }

  create(value: Model) {
    return this.collection
      .add(unwrapValue(value))
      .then(ref => new Document<Model>(buildRef<Model>(ref.path), value))
  }
}

export class Query<Model> {
  collection: Collection<Model>
  query?: FirestoreQuery
  get() {
    if (!this.query) {
      throw new Error(
        "Can't resolve the query because none of the filters were called."
      )
    }

    return this.query.get().then(querySnap =>
      querySnap.docs.map(docSnap => {
        const ref = buildRef<Model>(docSnap.ref.path)
        const data = docSnap.data() as Model
        return new Document<Model>(ref, data)
      })
    )
  }

  getOne() {
    return this.limit(1)
      .get()
      .then(values => values[0] as Document<Model> | undefined)
  }

  sub(
    onValue: (values: Document<Model>[]) => void,
    onError: (err: any) => void
  ) {
    if (!this.query) {
      throw new Error(
        "Can't resolve the query because none of the filters were called."
      )
    }

    return this.query.onSnapshot(
      querySnap =>
        onValue(
          querySnap.docs.map(docSnap => {
            const ref = buildRef<Model>(docSnap.ref.path)
            const data = docSnap.data() as Model
            return new Document<Model>(ref, data)
          })
        ),
      onError
    )
  }

  subOne(
    onValue: (values: Document<Model>) => void,
    onError: (err: any) => void
  ) {
    return this.sub(values => onValue(values[0]), onError)
  }
}

// TODO: Remove it from export (it was added for transaction prototype)
export function refToDoc<Model>(ref: Ref<Model>) {
  return store.doc(ref.path)
}

export function getRefId<Model>(ref: Ref<Model>) {
  return refToDoc(ref).id
}

export function buildRef<Model>(path: string) {
  return { __type__: 'ref', path } as Ref<Model>
}

export async function getRef<Model>(ref: Ref<Model>) {
  const doc = refToDoc(ref)
  const snap = await doc.get()
  const data = snap.data() as Model
  return createDocumentOrNull<Model>(ref, data)
}

export function subRef<Model>(
  ref: Ref<Model>,
  onValue: (document: Document<Model> | null) => void,
  onError: (error: any) => void
) {
  const doc = refToDoc(ref)
  const unsub = doc.onSnapshot(snap => {
    const ref = buildRef<Model>(snap.ref.path)
    const data = snap.data() as Model
    const document = createDocumentOrNull<Model>(ref, data)
    onValue(document)
  }, onError)
  return unsub
}

export type ModelUpdatePayload<Model> = ModelUpdate<Model> | Model

export async function updateRef<Model>(
  ref: Ref<Model>,
  update: ModelUpdatePayload<Model>
) {
  const doc = refToDoc(ref)
  return doc.update(unwrapValue(update)) // TODO: Return something meaningful
}

export async function setRef<Model>(ref: Ref<Model>, data: Model) {
  const doc = refToDoc(ref)
  return doc.set(unwrapValue(data)).then(() => new Document<Model>(ref, data))
}

export async function deleteRef<Model>(ref: Ref<Model>) {
  const doc = refToDoc(ref)
  return doc.delete()
}

type TransactionFunction = (t: FirestoreTransaction) => Promise<any>

export function transaction(transactionFn: TransactionFunction) {
  return store.runTransaction(transactionFn)
}

export async function transactionGet<Model>(
  t: FirestoreTransaction,
  ref: Ref<Model>
) {
  const doc = refToDoc(ref)
  const snap = await t.get(doc)
  const data = snap.data() as Model
  return createDocumentOrNull<Model>(ref, data)
}

export function transactionSet<Model>(
  t: FirestoreTransaction,
  ref: Ref<Model>,
  data: Model
) {
  const doc = refToDoc(ref)
  t.set(doc, unwrapValue(data))
}

export function transactionUpdate<Model>(
  t: FirestoreTransaction,
  ref: Ref<Model>,
  update: ModelUpdatePayload<Model>
) {
  const doc = refToDoc(ref)
  t.update(doc, unwrapValue(update)) // TODO: Return something meaningful
}

export function batch(): FirebaseWriteBatch {
  return store.batch()
}

export function batchSet<Model>(
  b: FirebaseWriteBatch,
  ref: Ref<Model>,
  data: Model
) {
  const doc = refToDoc(ref)
  b.set(doc, unwrapValue(data))
}

export const batchSize = 500
