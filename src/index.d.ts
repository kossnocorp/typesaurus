import type { TypesaurusCore as Core } from './types/core'

export const schema: Core.Function

export namespace Typesaurus {
  /**
   * Infers schema types. Useful to define function arguments that accept
   * collection doc, ref, id or data.
   */
  export type InferSchema<DB extends Core.DB<any, any>> = Core.InferSchema<DB>

  /**
   * Narrows doc type. If your doc has multiple shapes, the type will help you
   * narrow down data type to a specific type.
   */
  export type NarrowDoc<
    OriginalDoc extends Core.Doc<[any, any]>,
    NarrowToModel extends Core.ModelData<any>
  > = Core.NarrowDoc<OriginalDoc, NarrowToModel>

  export type Data<Model extends Core.ModelType> = Core.ModelData<Model>

  export type Id<Path extends string> = Core.Id<Path>

  export type Collection<
    Model extends Core.ModelType,
    Path extends string
  > = Core.Collection<[Model, Id<Path>]>

  export type Ref<Model extends Core.ModelType, Path extends string> = Core.Ref<
    [Model, Id<Path>]
  >

  export type Doc<Model extends Core.ModelType, Path extends string> = Core.Doc<
    [Model, Id<Path>]
  >

  export type ModelType = Core.ModelType

  export type ServerDateStrategy = Core.ServerDateStrategy

  export type RuntimeEnvironment = Core.RuntimeEnvironment

  export type ServerDate = Core.ServerDate
}

export { transaction } from './transaction'

export { groups } from './groups'

export { batch } from './batch'
