import { Ref } from '../ref'

/**
 * The document type. It contains the reference in the DB and the model data.
 */
export interface Doc<Model> {
  __type__: 'doc'
  data: Model
  ref: Ref<Model>
}

/**
 * Creates a document object.
 *
 * ```ts
 * import { doc, ref, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * doc(ref(users, '00sHm46UWKObv2W7XK9e'), { name: 'Sasha' })
 * //=> {
 * //=>   __type__: 'doc',
 * //=>   data: { name: 'Sasha' },
 * //=>   ref: {,
 * //=>      __type__: 'ref'
 * //=>     collection: { __type__: 'collection', path: 'users' },
 * //=>     id: '00sHm46UWKObv2W7XK9e'
 * //=>   }
 * //=> }
 * ```
 *
 * @param ref - The document reference
 * @param data - The model data
 * @returns The document object
 */
export function doc<Model>(ref: Ref<Model>, data: Model): Doc<Model> {
  return { __type__: 'doc', ref, data }
}
