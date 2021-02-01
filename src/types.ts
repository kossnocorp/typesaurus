import { ServerDate, SetValue } from '.'
import { RuntimeEnvironment } from './adaptor/types'

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

export type WriteOptions<Environment extends RuntimeEnvironment | undefined> = {
  assertEnvironment?: Environment
}
