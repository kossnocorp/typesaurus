/**
 * Deeply replaces all `undefined` values in the data with `null`. It emulates
 * the Firestore behavior.
 *
 * @param data - the data to convert
 * @returns the data with undefined values replaced with null
 */
export function data(value) {
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const newValue = Array.isArray(value) ? [] : {}
    for (const key in value) {
      newValue[key] = value[key] === undefined ? null : data(value[key])
    }
    return newValue
  } else {
    return value
  }
}
