import nativeFirestore, {
  firebase,
  FirebaseFirestoreTypes
} from '@react-native-firebase/firestore'
// @ts-ignore: React Native Firebase doesn't export types for internal modules
import FirestoreDocumentReference from '@react-native-firebase/firestore/lib/FirestoreDocumentReference'
import { getAll } from './utils'

const DocumentReference = FirestoreDocumentReference as FirebaseFirestoreTypes.DocumentReference

export default async function adaptor() {
  const firestore = nativeFirestore()
  // At the moment, the React Native Firebase adaptor doesn't support getAll.
  if (!('getAll' in firestore)) Object.assign(firestore, { getAll })
  return {
    firestore,
    consts: {
      DocumentReference,
      Timestamp: firebase.firestore.Timestamp,
      FieldValue: firebase.firestore.FieldValue
    }
  }
}

export function injectAdaptor() {
  throw new Error(
    'Injecting adaptor is not supported in the native environment'
  )
}
