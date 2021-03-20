import type { SetValue } from '.'
import type { LimitQuery } from './limit'
import type { OrderQuery } from './order'
import type { WhereQuery } from './where'

export interface ServerDate extends Date {
  __dontUseWillBeUndefined__: true
}

export type ServerTimestampsStrategy = 'estimate' | 'previous' | 'none'

export type RuntimeEnvironment = 'node' | 'web'

export type OnMissing<Model> = ((id: string) => Model) | 'ignore'

/**
 * Type of the data passed to the set function. It extends the model
 * allowing to set server date field value.
 */
export type WriteModel<
  Model,
  Environment extends RuntimeEnvironment | undefined
> = {
  [Key in keyof Model]:
    | (Exclude<Model[Key], undefined> extends ServerDate // First, ensure ServerDate is properly set
        ? Environment extends 'node' // Date can be used only in the node environment
          ? Date | ServerDate
          : ServerDate
        : Model[Key] extends object // If it's an object, recursively pass through SetModel
        ? WriteModel<Model[Key], Environment>
        : Model[Key])
    | SetValue<Model[Key]>
}

export interface OperationOptions<
  Environment extends RuntimeEnvironment | undefined
> {
  assertEnvironment?: Environment
}

export interface DocOptions<ServerTimestamps extends ServerTimestampsStrategy> {
  serverTimestamps?: ServerTimestamps
}

export interface OnMissingOptions<Model> {
  onMissing?: OnMissing<Model>
}

export interface RealtimeOptions {
  includeMetadataChanges?: boolean
}

/**
 * The query type.
 */
export type Query<Model, Key extends keyof Model> =
  | OrderQuery<Model, Key>
  | WhereQuery<Model>
  | LimitQuery
