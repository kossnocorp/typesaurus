import nativeFirestore, {
  FirebaseFirestoreTypes
} from '@react-native-firebase/firestore'
// @ts-ignore: React Native Firebase doesn't export types for internal modules
import FirestoreDocumentReference from '@react-native-firebase/firestore/lib/FirestoreDocumentReference'
// @ts-ignore
import FirestoreFieldValue from '@react-native-firebase/firestore/lib/FirestoreFieldValue'
// @ts-ignore
import FirestoreTimestamp from '@react-native-firebase/firestore/lib/FirestoreTimestamp'
import { getAll } from './utils'

const DocumentReference = FirestoreDocumentReference as FirebaseFirestoreTypes.DocumentReference
const Timestamp = FirestoreTimestamp as FirebaseFirestoreTypes.Timestamp
const FieldValue = FirestoreFieldValue as FirebaseFirestoreTypes.FieldValue

export default async function adaptor() {
  const firestore = nativeFirestore()
  // At the moment, the React Native Firebase adaptor doesn't support getAll.
  if (!('getAll' in firestore)) Object.assign(firestore, { getAll })
  return {
    firestore,
    consts: { DocumentReference, Timestamp, FieldValue }
  }
}

export function injectAdaptor() {
  throw new Error(
    'Injecting adaptor is not supported in the native environment'
  )
}
