import type { TypesaurusCore } from './types/core'

export const schema: TypesaurusCore.Function

export namespace Typesaurus {
  export type InferSchema<DB extends TypesaurusCore.DB<any, any>> =
    TypesaurusCore.InferSchema<DB>

  export type NarrowDoc<
    OriginalDoc extends TypesaurusCore.Doc<[any, any]>,
    NarrowToModel extends TypesaurusCore.ModelData<any>
  > = TypesaurusCore.NarrowDoc<OriginalDoc, NarrowToModel>

  export type Data<Model extends TypesaurusCore.ModelType> =
    TypesaurusCore.ModelData<Model>

  export type Id<Path extends string> = TypesaurusCore.Id<Path>

  export type Collection<
    Model extends TypesaurusCore.ModelType,
    Path extends string
  > = TypesaurusCore.Collection<[Model, Id<Path>]>

  export type Ref<
    Model extends TypesaurusCore.ModelType,
    Path extends string
  > = TypesaurusCore.Ref<[Model, Id<Path>]>

  export type Doc<
    Model extends TypesaurusCore.ModelType,
    Path extends string
  > = TypesaurusCore.Doc<[Model, Id<Path>]>

  export type ModelType = TypesaurusCore.ModelType

  export type ServerDateStrategy = TypesaurusCore.ServerDateStrategy

  export type RuntimeEnvironment = TypesaurusCore.RuntimeEnvironment

  export type ServerDate = TypesaurusCore.ServerDate
}

export { transaction } from './transaction'

export { groups } from './groups'

export { batch } from './batch'
