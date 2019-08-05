/**
 * Browser Firestore adaptor.
 */

import firebase from 'firebase/app'
import 'firebase/firestore'

export default function store() {
  return firebase.firestore()
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
