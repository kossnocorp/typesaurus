/**
 * Node.js Firestore adaptor.
 */

import * as firestore from '@google-cloud/firestore'
import * as admin from 'firebase-admin'
import type {
  DocOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy
} from '../types'
import type { DocumentMetaData } from './types'

export type Adaptor = {
  firestore: admin.firestore.Firestore
  consts: AdaptorConsts
  environment: RuntimeEnvironment
  getDocMeta: (
    snapshot: admin.firestore.DocumentSnapshot
  ) => DocumentMetaData | {}
  getDocData: (
    snapshot: admin.firestore.DocumentSnapshot,
    options?: DocOptions<ServerTimestampsStrategy>
  ) => FirestoreDocumentData | undefined
}

export type AdaptorFirestore = () => admin.firestore.Firestore

export type AdaptorConsts = {
  DocumentReference: typeof admin.firestore.DocumentReference
  Timestamp: typeof admin.firestore.Timestamp
  FieldPath: typeof admin.firestore.FieldPath
  FieldValue: typeof admin.firestore.FieldValue
}

const adminFirestore = () => admin.firestore()
let currentFirestore: AdaptorFirestore = adminFirestore

const adminConsts = {
  DocumentReference: admin.firestore.DocumentReference,
  Timestamp: admin.firestore.Timestamp,
  FieldPath: admin.firestore.FieldPath,
  FieldValue: admin.firestore.FieldValue
}
let currentConsts: AdaptorConsts = adminConsts

export default async function adaptor(): Promise<Adaptor> {
  return {
    firestore: currentFirestore(),
    consts: currentConsts,
    environment: 'node',
    getDocMeta: () => ({}),
    getDocData: (snapshot) => snapshot.data()
  }
}

export function injectAdaptor(
  firestore: AdaptorFirestore,
  consts: AdaptorConsts
) {
  currentFirestore = firestore
  currentConsts = consts
}

export type FirestoreQuery = admin.firestore.Query
export type FirestoreDocumentReference = admin.firestore.DocumentReference
export type FirestoreDocumentData = admin.firestore.DocumentData
export type FirestoreTimestamp = admin.firestore.Timestamp
export type FirebaseWriteBatch = admin.firestore.WriteBatch
export type FirestoreCollectionReference = admin.firestore.CollectionReference
export type FirestoreTransaction = admin.firestore.Transaction
// TODO: Use admin reference after they added to firebase-admin
export type FirestoreOrderByDirection = firestore.OrderByDirection
export type FirestoreWhereFilterOp = firestore.WhereFilterOp
export type FirestoreQuerySnapshot<
  T = FirestoreDocumentData
> = firestore.QuerySnapshot<T>
export type FirestoreDocumentSnapshot<
  T = FirestoreDocumentData
> = firestore.DocumentSnapshot<T>
