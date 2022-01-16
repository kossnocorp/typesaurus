import { pathToRef, Ref, refToFirestoreDocument } from '../ref'
import { UpdateValue } from '../value'
import { Adaptor } from '../adaptor'
import { Settings } from '../settings';

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param adaptor - the adaptor
 * @param data - the data to convert
 */
export function unwrapData(adaptor: Adaptor, data: any): any {
  if (data && typeof data === 'object') {
    if (data.__type__ === 'ref') {
      return refToFirestoreDocument(adaptor, data as Ref<any>)
    } else if (data.__type__ === 'value') {
      const fieldValue = data as UpdateValue<any, any>
      switch (fieldValue.kind) {
        case 'remove':
          return adaptor.consts.FieldValue.delete()
        case 'increment':
          return adaptor.consts.FieldValue.increment(fieldValue.number)
        case 'arrayUnion':
          return adaptor.consts.FieldValue.arrayUnion(
            ...unwrapData(adaptor, fieldValue.values)
          )
        case 'arrayRemove':
          return adaptor.consts.FieldValue.arrayRemove(
            ...unwrapData(adaptor, fieldValue.values)
          )
        case 'serverDate':
          return adaptor.consts.FieldValue.serverTimestamp()
      }
    } else if (data instanceof Date) {
      return adaptor.consts.Timestamp.fromDate(data)
    }

    const unwrappedObject: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data
    )
    Object.keys(unwrappedObject).forEach((key) => {
      unwrappedObject[key] = unwrapData(adaptor, unwrappedObject[key])
    })
    return unwrappedObject
  } else if (data === undefined && Settings.undefinedToNull) {
    return null
  } else {
    return data
  }
}

/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param consts - the adaptor constants
 * @param data - the data to convert
 */
export function wrapData(adaptor: Adaptor, data: unknown) {
  if (data instanceof adaptor.consts.DocumentReference) {
    return pathToRef(data.path)
  } else if (data instanceof adaptor.consts.Timestamp) {
    return data.toDate()
  } else if (data && typeof data === 'object') {
    const wrappedData: { [key: string]: any } = Object.assign(
      Array.isArray(data) ? [] : {},
      data
    )
    Object.keys(wrappedData).forEach((key) => {
      wrappedData[key] = wrapData(adaptor, wrappedData[key])
    })
    return wrappedData
  } else {
    return data
  }
}
