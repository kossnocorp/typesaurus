/**
 * Lazy browser Firestore adaptor.
 */

import { getAll } from '../utils'

export default async function adaptor() {
  const { default: firebase } = await import('firebase/app')
  await import('firebase/firestore')

  const firestore = firebase.firestore()
  // At the moment, the browser's Firestore adaptor doesn't support getAll.
  // Get rid of the fallback when the issue is closed:
  // https://github.com/firebase/firebase-js-sdk/issues/1176
  if (!('getAll' in firestore)) return Object.assign(firestore, { getAll })

  return {
    firestore,
    consts: {
      DocumentReference: firebase.firestore.DocumentReference,
      Timestamp: firebase.firestore.Timestamp,
      FieldValue: firebase.firestore.FieldValue
    }
  }
}

export function injectAdaptor() {
  throw new Error(
    'Injecting adaptor is not supported in the browser environment'
  )
}

// export type FirestoreQuery = type import('firebase').firestore.Query
// export type FirestoreDocumentReference = firebase.firestore.DocumentReference
// export type FirestoreDocumentData = firebase.firestore.DocumentData
// export type FirestoreTimestamp = firebase.firestore.Timestamp
// export type FirestoreCollectionReference = firebase.firestore.CollectionReference
// export type FirestoreOrderByDirection = firebase.firestore.OrderByDirection
// export type FirestoreWhereFilterOp = firebase.firestore.WhereFilterOp
// export type FirestoreTransaction = firebase.firestore.Transaction
// export type FirebaseWriteBatch = firebase.firestore.WriteBatch
