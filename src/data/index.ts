import {
  FirestoreDocumentReference,
  FirestoreFieldValue,
  FirestoreTimestamp
} from '../adaptor'
import { pathToRef, Ref, refToFirebaseDocument } from '../ref'
import { UpdateValue } from '../value'

/**
 *
 * @param value - the value to convert
 */
export function unwrapData(value: any) {
  if (value instanceof Date) {
    return FirestoreTimestamp.fromDate(value)
  } else if (value && typeof value === 'object') {
    if (value.__type__ === 'ref') {
      return refToFirebaseDocument(value as Ref<any>)
    } else if (value.__type__ === 'value') {
      const fieldValue = value as UpdateValue<any>
      switch (fieldValue.kind) {
        case 'clear':
          return FirestoreFieldValue.delete()
        case 'increment':
          return FirestoreFieldValue.increment(fieldValue.number)
        case 'arrayUnion':
          return FirestoreFieldValue.arrayUnion(...fieldValue.values)
        case 'arrayRemove':
          return FirestoreFieldValue.arrayRemove(...fieldValue.values)
        case 'serverDate':
          return FirestoreFieldValue.serverTimestamp()
      }
    }

    const unwrappedObject: { [key: string]: any } = Object.assign(
      Array.isArray(value) ? [] : {},
      value
    )
    Object.keys(unwrappedObject).forEach(key => {
      unwrappedObject[key] = unwrapData(unwrappedObject[key])
    })
    return unwrappedObject
  } else if (value === undefined) {
    return null
  } else {
    return value
  }
}

export function wrapData(data: unknown) {
  if (data instanceof FirestoreDocumentReference) {
    return pathToRef(data.path)
  } else if (data instanceof FirestoreTimestamp) {
    return data.toDate()
  } else if (data && typeof data === 'object') {
    const wrappedData: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data
    )
    Object.keys(wrappedData).forEach(key => {
      wrappedData[key] = wrapData(wrappedData[key])
    })
    return wrappedData
  } else {
    return data
  }
}
