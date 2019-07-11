import { Ref } from '../ref'

export interface Doc<Model> {
  __type__: 'doc'
  data: Model
  ref: Ref<Model>
}

export function doc<Model>(ref: Ref<Model>, data: Model): Doc<Model> {
  return { __type__: 'doc', ref, data }
}
