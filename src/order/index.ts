import { FirestoreOrderByDirection } from '../adaptor'

export interface OrderQuery<Model> {
  type: 'order'
  field: keyof Model
  method: FirestoreOrderByDirection
}

export default function order<Model>(
  field: keyof Model,
  method: FirestoreOrderByDirection
): OrderQuery<Model> {
  return {
    type: 'order',
    field,
    method
  }
}
