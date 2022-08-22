import type { Typesaurus } from './types/core'

export const schema: Typesaurus.Function

export type Id<Path extends string> = Typesaurus.Id<Path>

export type Collection<
  Model extends Typesaurus.ModelType,
  Path extends string
> = Typesaurus.Collection<[Model, Path]>

export type Ref<
  Model extends Typesaurus.ModelType,
  Path extends string
> = Typesaurus.Ref<[Model, Path]>

export type Doc<
  Model extends Typesaurus.ModelType,
  Path extends string
> = Typesaurus.Doc<[Model, Path]>

export type ModelType = Typesaurus.ModelType

export type ServerDateStrategy = Typesaurus.ServerDateStrategy

export type RuntimeEnvironment = Typesaurus.RuntimeEnvironment

export type ServerDate = Typesaurus.ServerDate

export { transaction } from './transaction'

export { groups } from './groups'

export { batch } from './batch'
