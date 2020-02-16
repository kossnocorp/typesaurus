import { consts } from '../adaptor'
import { pathToRef, Ref, refToFirestoreDocument } from '../ref'
import { UpdateValue } from '../value'

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 */
export function unwrapData(data: any): any {
  if (data && typeof data === 'object') {
    if (data.__type__ === 'ref') {
      return refToFirestoreDocument(data as Ref<any>)
    } else if (data.__type__ === 'value') {
      const fieldValue = data as UpdateValue<any>
      switch (fieldValue.kind) {
        case 'remove':
          return consts().FieldValue.delete()
        case 'increment':
          return consts().FieldValue.increment(fieldValue.number)
        case 'arrayUnion':
          return consts().FieldValue.arrayUnion(...unwrapData(fieldValue.values))
        case 'arrayRemove':
          return consts().FieldValue.arrayRemove(...unwrapData(fieldValue.values))
        case 'serverDate':
          return consts().FieldValue.serverTimestamp()
      }
    } else if (data instanceof Date) {
      return consts().Timestamp.fromDate(data)
    }

    const unwrappedObject: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data
    )
    Object.keys(unwrappedObject).forEach(key => {
      unwrappedObject[key] = unwrapData(unwrappedObject[key])
    })
    return unwrappedObject
  } else if (data === undefined) {
    return null
  } else {
    return data
  }
}

/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param data - the data to convert
 */
export function wrapData(data: unknown) {
  if (data instanceof consts().DocumentReference) {
    return pathToRef(data.path)
  } else if (data instanceof consts().Timestamp) {
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
