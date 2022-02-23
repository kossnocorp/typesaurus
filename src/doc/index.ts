import { nullifyData } from '../data'
import type { Ref } from '../ref'
import type {
  RuntimeEnvironment,
  ServerDate,
  ServerTimestampsStrategy
} from '../types'

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
  firestoreData?: boolean
}

export interface WebDoc<
  Model,
  FromCache extends boolean,
  ServerTimestamps extends ServerTimestampsStrategy
> {
  __type__: 'doc'
  ref: Ref<Model>
  data: FromCache extends false
    ? AnyModelData<Model, false>
    : ServerTimestamps extends 'estimate'
    ? AnyModelData<Model, false>
    : AnyModelData<Model, true>
  environment: 'web'
  fromCache: FromCache
  hasPendingWrites: boolean
  serverTimestamps: ServerTimestamps
  firestoreData?: boolean
}

export type ModelNodeData<Model> = AnyModelData<Model, false>

// NOTE: For some reason this won't work: AnyModelData<Model, boolean>
export type ModelData<Model> =
  | AnyModelData<Model, true>
  | AnyModelData<Model, false>

export type AnyModelData<Model, ServerDateNullable extends boolean> = {
  [Key in keyof Model]: ModelField<Model[Key], ServerDateNullable>
}

type ModelField<
  Field,
  ServerDateNullable extends boolean
> = Field extends ServerDate // Process server dates
  ? ServerDateNullable extends true
    ? Date | null
    : Date
  : Field extends Date // Stop dates from being processed as an object
  ? Field
  : Field extends object // If it's an object, recursively pass through ModelData
  ? AnyModelData<Field, ServerDateNullable>
  : Field

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
    firestoreData?: boolean
    environment: Environment
    fromCache?: FromCache
    hasPendingWrites?: boolean
    serverTimestamps?: ServerTimestamps
  }
): AnyDoc<Model, Environment, FromCache, ServerTimestamps> {
  return ({
    __type__: 'doc',
    ref,
    // TODO: Unwrap if it is Firestore data? This sounds like a good idea but it
    // requires adaptor to be presence hence asking for it in the arguments
    // or making the function async.
    data: meta.firestoreData ? data : nullifyData(data),
    ...meta
  } as unknown) as AnyDoc<Model, Environment, FromCache, ServerTimestamps>
}
