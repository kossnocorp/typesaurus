import type { TypesaurusCore as Core } from './types/core'

export * from './transaction'
export * from './groups'
export * from './batch'
export * from './helpers'

export const schema: Core.Function

export namespace Typesaurus {
  /**
   * Infers schema types. Useful to define function arguments that accept
   * collection doc, ref, id or data.
   */
  export type Schema<DB extends Core.DB<any, any>> = Core.InferSchema<DB>

  /**
   * Narrows doc type. If your doc has multiple shapes, the type will help you
   * narrow down data type to a specific type.
   */
  export type NarrowDoc<
    OriginalDoc extends Core.Doc<Core.DocDef, Core.DocProps>,
    NarrowToModel extends Core.AnyData<any>
  > = Core.NarrowDoc<OriginalDoc, NarrowToModel>

  export type Def<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags
  > = {
    Model: Model
    Name: Name
    Id: Id<Path>
    WideModel: WideModel
    Flags: Flags
  }

  /**
   * Define custom id passing the collection path string as the generic.
   *
   * [Learn more on the docs website](https://typesaurus.com/docs/api/type/id).
   *
   * @example
   * import { schema, Typesaurus } from 'typesaurus'
   *
   * const db = schema(($) => {
   *   organizations: $.collection<Organization>(),
   *   subscriptions: $.collection<Subscription, Typesaurus.Id<'organizations'>>()
   * })
   */
  export type Id<Path extends string> = Core.Id<Path>

  export type Collection<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags
  > = Core.AnyCollection<Def<Model, Name, Path, WideModel, Flags>>

  export type Ref<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags
  > = Core.Ref<Def<Model, Name, Path, WideModel, Flags>>

  export type Doc<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags
  > = Core.Doc<Def<Model, Name, Path, WideModel, Flags>, Core.DocProps>

  export type Model<Model extends Core.ModelType> = Core.ResolveModelType<Model>

  export type Data<Model extends Core.ModelType> = Core.AnyData<
    Core.ResolveModelType<Model>
  >

  export type ModelType = Core.ModelType

  export type ServerDateStrategy = Core.ServerDateStrategy

  export type RuntimeEnvironment = Core.RuntimeEnvironment

  export type ServerDate = Core.ServerDate

  /**
   * Concats models into single variable model type. Useful to define and export
   * variable models ouside of the centraliazed schema definition.
   */
  export type ConcatModel<
    ModelToConcatTo extends ModelType,
    ModelToConcat extends ModelType
  > = Core.ConcatModel<ModelToConcatTo, ModelToConcat>
}
