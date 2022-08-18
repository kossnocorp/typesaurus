import type { Typesaurus } from './types/typesaurus'

export const schema: Typesaurus.Function

export type Id<Path extends string> = Typesaurus.Id<Path>

export type Ref<
  Model extends Typesaurus.ModelType,
  Path extends string
> = Typesaurus.Ref<Model, Path>

export type Doc<
  Model extends Typesaurus.ModelType,
  Path extends string
> = Typesaurus.Ref<Model, Path>

export type ServerDate = Typesaurus.ServerDate

export { transaction } from './transaction'

export { groups } from './groups'

export { batch } from './batch'
