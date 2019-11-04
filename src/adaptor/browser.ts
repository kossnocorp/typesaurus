/**
 * Browser Firestore adaptor.
 */

import * as firebase from 'firebase/app'
import 'firebase/firestore'

export default function store() {
  const firestore = firebase.firestore()
  // At the moment, the browser's Firestore adaptor doesn't support getAll.
  // Get rid of the fallback when the issue is closed:
  // https://github.com/firebase/firebase-js-sdk/issues/1176
  if (!('getAll' in firestore)) return Object.assign(firestore, { getAll })
  return firestore
}

function getAll(...docs: FirestoreDocumentReference[]) {
  return Promise.all(docs.map(doc => doc.get()))
}

export type FirestoreQuery = firebase.firestore.Query
export type FirestoreDocumentReference = firebase.firestore.DocumentReference
export const FirestoreDocumentReference = firebase.firestore.DocumentReference
export type FirestoreDocumentData = firebase.firestore.DocumentData
export type FirestoreTimestamp = firebase.firestore.Timestamp
export const FirestoreTimestamp = firebase.firestore.Timestamp
export type FirestoreCollectionReference = firebase.firestore.CollectionReference
export type FirestoreOrderByDirection = firebase.firestore.OrderByDirection
export type FirestoreWhereFilterOp = firebase.firestore.WhereFilterOp
export type FirestoreTransaction = firebase.firestore.Transaction
export const FirestoreFieldValue = firebase.firestore.FieldValue
export type FirebaseWriteBatch = firebase.firestore.WriteBatch
