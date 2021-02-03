/**
 * Lazy browser Firestore adaptor.
 */

import type { DocOptions, ServerTimestampsStrategy } from '../../types'
import { getAll } from '../utils'
import type firebase from 'firebase'

export default async function adaptor() {
  const { default: firebase } = await import('firebase/app')
  await import('firebase/firestore')

  const firestore = firebase.firestore()
  // At the moment, the browser's Firestore adaptor doesn't support getAll.
  // Get rid of the fallback when the issue is closed:
  // https://github.com/firebase/firebase-js-sdk/issues/1176
  if (!('getAll' in firestore)) Object.assign(firestore, { getAll })

  return {
    firestore,
    consts: {
      DocumentReference: firebase.firestore.DocumentReference,
      Timestamp: firebase.firestore.Timestamp,
      FieldPath: firebase.firestore.FieldPath,
      FieldValue: firebase.firestore.FieldValue
    },
    environment: 'web',
    getDocMeta: (snapshot: firebase.firestore.DocumentSnapshot) => ({
      fromCache: snapshot.metadata.fromCache,
      hasPendingWrites: snapshot.metadata.hasPendingWrites
    }),
    getDocData: (
      snapshot: firebase.firestore.DocumentSnapshot,
      options?: DocOptions<ServerTimestampsStrategy>
    ) => snapshot.data(options)
  }
}

export function injectAdaptor() {
  throw new Error(
    'Injecting adaptor is not supported in the browser environment'
  )
}
