import { FirestoreOrderByDirection } from '../adaptor'
import { Cursor } from '../cursor'

export interface OrderQuery<Model, Key extends keyof Model> {
  type: 'order'
  field: Key
  method: FirestoreOrderByDirection
  cursors: Cursor<Model, Key>[] | undefined
}

function order<Model, Key extends keyof Model>(
  field: Key
): OrderQuery<Model, Key>

function order<Model, Key extends keyof Model>(
  field: Key,
  method: Cursor<Model, Key>[]
): OrderQuery<Model, Key>

function order<Model, Key extends keyof Model>(
  field: Key,
  method: FirestoreOrderByDirection,
  cursors?: Cursor<Model, Key>[]
): OrderQuery<Model, Key>

function order<Model, Key extends keyof Model>(
  field: Key,
  maybeMethod?: FirestoreOrderByDirection | Cursor<Model, Key>[],
  maybeCursors?: Cursor<Model, Key>[]
): OrderQuery<Model, Key> {
  let method: FirestoreOrderByDirection = 'asc'
  let cursors

  if (maybeMethod) {
    if (typeof maybeMethod === 'string') {
      method = maybeMethod
      cursors = maybeCursors
    } else {
      cursors = maybeMethod
    }
  }

  return {
    type: 'order',
    field,
    method,
    cursors
  }
}

export default order
