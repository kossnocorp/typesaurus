import type { TypesaurusCore as Core } from "./types/core.js";

export * from "./types/batch.js";
export * from "./types/core.js";
export * from "./types/firebase.js";
export * from "./types/groups.js";
export * from "./types/helpers.js";
export * from "./types/query.js";
export * from "./types/transaction.js";
export * from "./types/update.js";
export * from "./types/utils.js";
export * from "./helpers/index.js";
export * from "./sp/index.js";

export declare const schema: Core.Function;

export namespace Typesaurus {
  /**
   * Infers schema types. Useful to define function arguments that accept
   * collection doc, ref, id or data.
   */
  export type Schema<DB extends Core.DB<any, any>> = Core.InferSchema<DB>;

  /**
   * Define custom id passing the collection path string as the generic.
   *
   * [Learn more on the docs website](https://typesaurus.com/docs/api/type/id).
   * })
   */
  export type Id<Path extends string> = Core.Id<Path>;

  export type Collection<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = Core.AnyCollection<Def<Model, Name, Path, WideModel, Flags>>;

  export type Ref<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = Core.Ref<Def<Model, Name, Path, WideModel, Flags>>;

  export type Doc<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = Core.Doc<Def<Model, Name, Path, WideModel, Flags>, Core.DocProps>;

  export type Data<Model extends Core.ModelType> = Core.AnyData<
    Core.IntersectVariableModelType<Model>
  >;

  /**
   * Narrows doc type. If your doc has variable model, the type will help you
   * narrow down the doc type to a specific data type.
   */
  export type NarrowDoc<
    OriginalDoc extends Core.Doc<any, any>,
    NarrowToModel extends Core.ModelObjectType,
  > = Core.NarrowDoc<OriginalDoc, NarrowToModel>;

  export type Def<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = {
    Model: Model;
    Name: Name;
    Id: Id<Path>;
    WideModel: WideModel;
    Flags: Flags;
  };

  export type ModelType = Core.ModelType;

  export type ServerDateStrategy = Core.ServerDateStrategy;

  export type RuntimeEnvironment = Core.RuntimeEnvironment;

  export type ServerDate = Core.ServerDate;

  /**
   * Concats models into single variable model type. Useful to define and export
   * variable models ouside of the centraliazed schema definition.
   */
  export type ConcatModel<
    ModelToConcatTo extends ModelType,
    ModelToConcat extends ModelType,
  > = Core.ConcatModel<ModelToConcatTo, ModelToConcat>;

  /**
   * Deeply normalizes server dates in a given type. It replaces ServerDate with
   * regular Date. It's useful when reusing interfaces in a non-Typesaurus
   * environment or when you need to store it in an array (where server dates
   * are not allowed).
   */
  export type NormalizeServerDates<Type> = Core.NormalizeServerDates<Type>;

  /**
   * Deeply adds null to all undefined values. It's useful for wrapping
   * your types when you expect data from Firestore where undefined values turn
   * into nulls.
   */
  export type Nullify<Type> = Core.Nullify<Type>;
}
