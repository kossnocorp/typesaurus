// import { Ref } from '../ref'

export type CursorMethod = 'startAfter' | 'startAt' | 'endBefore' | 'endAt'

export interface Cursor<Model, Key extends keyof Model> {
  method: CursorMethod
  value: Model[Key] | /*Ref<Model> |*/ undefined
}

export function startAfter<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'startAfter',
    value
  }
}

export function startAt<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'startAt',
    value
  }
}

export function endBefore<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'endBefore',
    value
  }
}

export function endAt<Model, Key extends keyof Model>(
  value: Model[Key] | /*Ref<Model> |*/ undefined
): Cursor<Model, Key> {
  return {
    method: 'endAt',
    value
  }
}
