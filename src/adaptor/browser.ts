/**
 * Browser Firestore adaptor.
 */

import firebase from 'firebase/app'
import 'firebase/firestore'

const store = firebase.firestore()
export default store

export type FirestoreQuery = firebase.firestore.Query
export type FirestoreDocumentReference = firebase.firestore.DocumentReference
export const FirestoreDocumentReference = firebase.firestore.DocumentReference
export type FirestoreCollectionReference = firebase.firestore.CollectionReference
export type FirestoreOrderByDirection = firebase.firestore.OrderByDirection
export type FirestoreWhereFilterOp = firebase.firestore.WhereFilterOp
export type FirestoreTransaction = firebase.firestore.Transaction
export const FirestoreFieldValue = firebase.firestore.FieldValue
export type FirebaseWriteBatch = firebase.firestore.WriteBatch
