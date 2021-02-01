import { RuntimeEnvironment, ServerTimestampsStrategy } from '../adaptor/types'
import { Ref } from '../ref'
import { ServerDate } from '../value'

export type DocOptions<ServerTimestamps extends ServerTimestampsStrategy> = {
  serverTimestamps?: ServerTimestamps
}

/**
 * The document type. It contains the reference in the DB and the model data.
 */
export type Doc<Model> = AnyDoc<
  Model,
  RuntimeEnvironment,
  boolean,
  ServerTimestampsStrategy
>

export type AnyDoc<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
> = Environment extends 'node'
  ? NodeDoc<Model>
  : FromCache extends false
  ? WebDoc<Model, false, ServerTimestamps>
  : ServerTimestamps extends 'estimate'
  ? WebDoc<Model, false, 'estimate'>
  : WebDoc<Model, FromCache, ServerTimestamps>
// NOTE: For some reason, FromCache and ServerTimestamps are not properly inferred:
// Environment extends 'node'
//   ? NodeDoc<Model>
//   : WebDoc<Model, FromCache, ServerTimestamps>

export interface NodeDoc<Model> {
  __type__: 'doc'
  ref: Ref<Model>
  data: ModelNodeData<Model>
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
    ? ModelData<Model, false>
    : ServerTimestamps extends 'estimate'
    ? ModelData<Model, false>
    : ModelData<Model, true>
  environment: 'web'
  fromCache: FromCache
  hasPendingWrites: boolean
  serverTimestamps: ServerTimestamps
}

export type ModelNodeData<Model> = ModelData<Model, false>

export type ModelData<Model, ServerDateNullable extends boolean = true> = {
  [Key in keyof Model]: Exclude<Model[Key], undefined> extends ServerDate // Process server dates
    ? ServerDateNullable extends true
      ? Date | null
      : Date
    : Exclude<Model[Key], undefined> extends Date // Stop dates from being processed as an object
    ? Model[Key]
    : Model[Key] extends object // If it's an object, recursively pass through ModelData
    ? ModelData<Model[Key], ServerDateNullable>
    : Model[Key]
}

export type ResolvedServerDate<
  Environment extends RuntimeEnvironment | undefined,
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
> = Environment extends 'node' // In node environment server dates are always defined
  ? Date
  : ResolvedWebServerDate<FromCache, ServerTimestamps>

export type ResolvedWebServerDate<
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
> = FromCache extends false | undefined // Server date is always defined when not from cache
  ? Date
  : ServerTimestamps extends 'estimate' // Or when the estimate strategy were used
  ? Date
  : Date | null

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
  Environment extends RuntimeEnvironment | undefined,
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model>,
  data: Model,
  meta: {
    environment: Environment
    fromCache?: FromCache
    hasPendingWrites?: boolean
    serverTimestamps?: ServerTimestamps
  }
): AnyDoc<Model, Environment, FromCache, ServerTimestamps> {
  return ({ __type__: 'doc', ref, data, ...meta } as unknown) as AnyDoc<
    Model,
    Environment,
    FromCache,
    ServerTimestamps
  >
}
