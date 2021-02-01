export function assertType<T>(value: T): asserts value is T {}

export type TypeEqual<T, U> = Exclude<T, U> extends never
  ? Exclude<U, T> extends never
    ? true
    : false
  : false
