import type { TypesaurusCore as Core } from "./types/core.js";
import type { TypesaurusShared as Shared } from "./types/shared.js";

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
   * The type represents your database structure and provides type shortcuts for
   * all kinds of data.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#schema)
   */
  export type Schema<DB extends Core.DB<any, any>> = Core.InferSchema<DB>;

  /**
   * Defines a server date. Use it to define a field that will be set to
   * the server date on creation.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#serverdate)
   */
  export type ServerDate = Core.ServerDate;

  /**
   * Deeply normalizes server dates in a given type. It replaces ServerDate with
   * regular Date. It's useful when reusing interfaces in a non-Typesaurus
   * environment or when you need to store it in an array (where server dates
   * are not allowed).
   */
  export type NormalizeServerDates<Type> = Core.NormalizeServerDates<Type>;

  /**
   * Deeply adds null to all undefined values. It's helpful in wrapping your
   * types when you expect data from Firestore, where undefined values turn into
   * nulls.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#nullify)
   */
  export type Nullify<Type> = Core.Nullify<Type>;

  /**
   * Narrows doc type. If your doc has a variable model, the type will help you
   * narrow down the doc type to a specific data type.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#narrowdoc)
   */
  export type NarrowDoc<
    OriginalDoc extends Core.Doc<any, any>,
    NarrowToModel extends Core.ModelObjectType,
  > = Core.NarrowDoc<OriginalDoc, NarrowToModel>;

  /**
   * Shared ref type. Unlike regular ref, shared ref lacks methods which
   * type-safety depends on knowing the full type of the model: `set`, `upset`,
   * and `as`. The `collection` is also limited.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#sharedref)
   */
  export type SharedRef<Model extends Core.ModelObjectType> = Shared.Ref<Model>;

  /**
   * Shared doc type. Unlike regular doc, shared doc lacks methods which
   * type-safety depends on knowing the full type of the model: `set`, `upset`,
   * and `as`. The `ref` is also limited.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#shareddoc)
   */
  export type SharedDoc<Model extends Core.ModelObjectType> = Shared.Doc<
    Model,
    Core.DocProps
  >;

  /**
   * Shared ref or doc type. Unlike regular ref and doc, shared doc lacks
   * methods which type-safety depends on knowing the full type of the model:
   * `set`, `upset`, and `as`.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#sharedentity)
   */
  export type SharedEntity<Model extends Core.ModelObjectType> =
    | Shared.Ref<Model>
    | Shared.Doc<Model, Core.DocProps>;

  /**
   * Shared collection type. Unlike regular collection, shared collection lacks
   * methods which type-safety depends on knowing the full type of the model:
   * `add`, `set`, `upset`, and `update`.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#sharedcollection)
   */
  export type SharedCollection<Model extends Core.ModelObjectType> =
    Shared.Collection<Model>;

  /**
   * Shared collection group type. Unlike regular group, shared group lacks
   * methods which type-safety depends on knowing the full type of the model:
   * `add`, `set`, `upset`, and `update`.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#sharedgroup)
   */
  export type SharedGroup<Model extends Core.ModelObjectType> =
    Shared.Group<Model>;

  /**
   * Concats models into single variable model type. Useful to define and export
   * variable models ouside of the centraliazed schema definition.
   */
  export type ConcatModel<
    ModelToConcatTo extends Core.ModelType,
    ModelToConcat extends Core.ModelType,
  > = Core.ConcatModel<ModelToConcatTo, ModelToConcat>;

  /**
   * The type represents the document id.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#id)
   *
   * @deprecated Use `SharedRef` instead. Might be removed in the next major version.
   */
  export type Id<Path extends string> = Core.Id<Path>;

  /**
   * The type allows defining collection types.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#collection)
   *
   * @deprecated Use `SharedRef` instead. Might be removed in the next major version.
   */
  export type Collection<
    Model extends Core.ModelType,
    Name extends string = any,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = Core.AnyCollection<Def<Model, Name, Path, WideModel, Flags>>;

  /**
   * The type represents the document reference type.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#ref)
   *
   * @deprecated Use `SharedRef` instead. Might be removed in the next major version.
   */
  export type Ref<
    Model extends Core.ModelType,
    Name extends string = any,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = Core.Ref<Def<Model, Name, Path, WideModel, Flags>>;

  /**
   * The type represents the document type.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#doc)
   *
   * @deprecated Use `SharedRef` instead. Might be removed in the next major version.
   */
  export type Doc<
    Model extends Core.ModelType,
    Name extends string = any,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = Core.Doc<Def<Model, Name, Path, WideModel, Flags>, Core.DocProps>;

  /**
   * The type represents the document data type
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#data)
   */
  export type Data<Model extends Core.ModelType> = Core.AnyData<
    Core.IntersectVariableModelType<Core.NullifyModel<Model>>
  >;

  /**
   * The type represents the document definition. It's in many methods as
   * a generic parameter.
   *
   * [Learn more on the docs website](https://typesaurus.com/types/typesaurus/#def)
   */
  export type Def<
    Model extends Core.ModelType,
    Name extends string,
    Path extends string = Name,
    WideModel extends Core.ModelType = Model,
    Flags extends Core.DocDefFlags = Core.DocDefFlags,
  > = {
    Model: Core.NullifyModel<Model>;
    Name: Name;
    Id: Id<Path>;
    WideModel: Core.NullifyModel<WideModel>;
    Flags: Flags;
  };
}
