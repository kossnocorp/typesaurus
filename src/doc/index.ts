import { Ref } from '../ref'
import { ServerDate } from '../value'

export type ServerTimestampsStrategy = 'estimate' | 'previous' | 'none'

/**
 * The document type. It contains the reference in the DB and the model data.
 */
export type Doc<
  Model,
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
> = NodeDoc<Model> | WebDoc<Model, FromCache, ServerTimestamps>

export interface NodeDoc<Model> {
  __type__: 'doc'
  ref: Ref<Model>
  data: Model
  environment: 'node'
  fromCache?: false
  hasPendingWrites?: false
  serverTimestamps?: undefined
}

export interface WebDoc<
  Model,
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
> {
  __type__: 'doc'
  ref: Ref<Model>
  data: FromCache extends false
    ? Model
    : ServerTimestamps extends 'estimate'
    ? Model
    : MaybeFromCache<Model>
  environment: 'web'
  fromCache: FromCache
  hasPendingWrites: boolean
  serverTimestamps: ServerTimestamps
}

export type MaybeFromCache<Model> = {
  [Key in keyof Model]: Model[Key] extends ServerDate
    ? Date | null
    : Model[Key] extends Date
    ? Date
    : Model[Key] extends {}
    ? MaybeFromCache<Model[Key]>
    : Model[Key]
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
export function doc<
  Model,
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model>,
  data: Model,
  meta: Omit<
    Doc<Model, FromCache, ServerTimestamps>,
    '__type__' | 'ref' | 'data'
  >
): Doc<Model, FromCache, ServerTimestamps> {
  return { __type__: 'doc', ref, data, ...meta } as Doc<
    Model,
    FromCache,
    ServerTimestamps
  >
}
