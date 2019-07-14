import firestore, {
  FirestoreDocumentReference,
  FirestoreFieldValue
} from '../adaptor/node'
import { Ref, pathToRef } from '../ref'

export type ValueIncrement = {
  __type__: 'value'
  operation: 'increment'
  number: number
}

export type ValueClear = {
  __type__: 'value'
  operation: 'clear'
}

export type AnyValue = ValueClear
export type Value<T> = T extends number ? AnyValue | ValueIncrement : AnyValue

export function increment(number: number): ValueIncrement {
  return { __type__: 'value', operation: 'increment', number }
}

export function clear(): ValueClear {
  return { __type__: 'value', operation: 'clear' }
}

export function unwrapValue(value: any) {
  if (value instanceof Document) {
    return refToDoc(value.ref)
  } else if (value && typeof value === 'object') {
    if (value.__type__ === 'ref') {
      return refToDoc(value)
    } else if (value.__type__ === 'value') {
      const fieldValue = value as Value<any>
      switch (fieldValue.operation) {
        case 'clear':
          return FirestoreFieldValue.delete()

        case 'increment':
          return FirestoreFieldValue.increment(fieldValue.number)
      }
    }

    const unwrappedObject: { [key: string]: any } = Object.assign(
      isArray(value) ? [] : {},
      value
    )
    Object.keys(unwrappedObject).forEach(key => {
      unwrappedObject[key] = unwrapValue(unwrappedObject[key])
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
  } else if (data && typeof data === 'object') {
    const wrappedData: { [key: string]: any } = Object.assign(
      isArray(data) ? [] : {},
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

export function isArray(object: any) {
  return Object.prototype.toString.call(object) === '[object Array]'
}

export function refToDoc<Model>(ref: Ref<Model>) {
  return firestore.doc(ref.path)
}
