import type { TypesaurusUtils as Utils } from "./utils.js";
import type { TypesaurusCore as Core } from "./core.js";
import type { TypesaurusUpdate as Update } from "./update.js";

export declare const transaction: TypesaurusTransaction.Function;

export namespace TypesaurusTransaction {
  export interface Function {
    <
      Schema extends Core.PlainSchema,
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      db: Core.DB<Schema>,
      options?: Core.OperationOptions<Environment>,
    ): ReadChain<Schema, Props>;
  }

  /**
   * The document reference type.
   */
  export interface ReadRef<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > {
    type: "ref";
    collection: ReadCollection<Def, Props>;
    id: Def["Id"];
  }

  /**
   * The document reference type.
   */
  export interface WriteRef<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > extends DocAPI<Def, Props> {
    type: "ref";
    collection: WriteCollection<Def, Props>;
    id: Def["Id"];
  }

  export interface DocAPI<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > {
    set(
      data: Core.WriteArg<Core.IntersectVariableModelType<Def["Model"]>, Props>,
    ): void;

    update(
      data: Update.Arg<
        Def["Flags"]["Reduced"] extends true
          ? Core.IntersectVariableModelType<Def["Model"]>
          : Core.SharedVariableModelType<Def["WideModel"]>,
        Props
      >,
    ): void;

    upset(
      data: Core.WriteArg<Core.IntersectVariableModelType<Def["Model"]>, Props>,
    ): void;

    remove(): void;
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface ReadDoc<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > {
    type: "doc";
    ref: ReadRef<Def, Props>;
    data: Props["environment"] extends "server"
      ? Core.ServerData<Core.IntersectVariableModelType<Def["Model"]>>
      : Core.Data<Core.IntersectVariableModelType<Def["Model"]>, "present">;
    props: Props;
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface WriteDoc<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > extends DocAPI<Def, Props> {
    type: "doc";
    ref: WriteRef<Def, Props>;
    data: Props["environment"] extends "server"
      ? Core.ServerData<Core.IntersectVariableModelType<Def["Model"]>>
      : Core.Data<Core.IntersectVariableModelType<Def["Model"]>, "present">;
    props: Props;

    narrow<NarrowToModel extends Core.ModelType>(
      fn: Core.DocNarrowFunction<
        Core.IntersectVariableModelType<Def["WideModel"]>,
        NarrowToModel
      >,
    ):
      | WriteDoc<
          {
            Model: NarrowToModel;
            Name: Def["Name"];
            Id: Def["Id"];
            WideModel: Def["WideModel"];
            Flags: Def["Flags"] & { Reduced: true };
          },
          Props
        >
      | undefined;
  }

  export type AnyWriteCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > =
    | WriteCollection<Def, Props>
    | NestedWriteCollection<Def, Props, WriteSchema<Props>>;

  export interface WriteSchema<Props extends Core.DocProps> {
    [CollectionPath: string]: AnyWriteCollection<Core.DocDef, Props>;
  }

  export interface NestedWriteCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
    NestedSchema extends WriteSchema<Props>,
  > extends WriteCollection<Def, Props> {
    (id: Def["Id"]): NestedSchema;
  }

  /**
   *
   */
  export interface WriteCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > {
    /** The Firestore path */
    path: string;

    set(
      id: Def["Id"],
      data: Core.WriteArg<Core.IntersectVariableModelType<Def["Model"]>, Props>,
    ): void;

    upset(
      id: Def["Id"],
      data: Core.WriteArg<Core.IntersectVariableModelType<Def["Model"]>, Props>,
    ): void;

    update(
      id: Def["Id"],
      data: Update.Arg<Core.SharedVariableModelType<Def["WideModel"]>, Props>,
    ): void;

    remove(id: Def["Id"]): void;
  }

  export type AnyReadCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > =
    | ReadCollection<Def, Props>
    | NestedReadCollection<Def, Props, ReadSchema<Props>>;

  export interface ReadSchema<Props extends Core.DocProps> {
    [CollectionPath: string]: AnyReadCollection<Core.DocDef, Props>;
  }

  export interface NestedReadCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
    NestedSchema extends ReadSchema<Props>,
  > extends ReadCollection<Def, Props> {
    (id: Def["Id"]): NestedSchema;
  }

  export interface ReadCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > extends Core.PlainCollection<Def> {
    /** The Firestore path */
    path: string;

    get(id: Def["Id"]): Promise<ReadDoc<Def, Props> | null>;
  }

  /**
   * The transaction read API object. It contains {@link ReadHelpers.get|get}
   * the function that allows reading documents from the database.
   */
  export interface ReadHelpers<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps,
  > {
    db: ReadDB<Schema, Props>;
  }

  /**
   * The transaction write API object. It unions a set of functions ({@link WriteHelpers.set|set},
   * {@link WriteHelpers.update|update} and {@link WriteHelpers.remove|remove})
   * that are similar to regular set, update and remove with the only
   * difference that the transaction counterparts will retry writes if
   * the state of data received with {@link ReadHelpers.get|get} would change.
   */
  export interface WriteHelpers<
    Schema extends Core.PlainSchema,
    ReadResult,
    Props extends Core.DocProps,
  > {
    /** The result of the read function. */
    result: ReadDocsToWriteDocs<ReadResult, Props>;

    db: WriteDB<Schema, Props>;
  }

  export type ReadDocsToWriteDocs<
    Result,
    Props extends Core.DocProps,
  > = Result extends ReadDoc<infer Def, Props>
    ? WriteDoc<Def, Props>
    : Result extends ReadRef<infer Def, Props>
      ? WriteRef<Def, Props>
      : Result extends object
        ? { [Key in keyof Result]: ReadDocsToWriteDocs<Result[Key], Props> }
        : Result;

  export interface ReadChain<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps,
  > {
    read: <ReadResult>(
      callback: ReadFunction<Schema, ReadResult, Props>,
    ) => WriteChain<Schema, ReadResult, Props>;
  }

  /**
   * The transaction body function type.
   */
  export type ReadFunction<
    Schema extends Core.PlainSchema,
    ReadResult,
    Props extends Core.DocProps,
  > = ($: ReadHelpers<Schema, Props>) => Promise<ReadResult>;

  export interface WriteChain<
    Schema extends Core.PlainSchema,
    ReadResult,
    Props extends Core.DocProps,
  > {
    write: <WriteResult>(
      callback: WriteFunction<Schema, ReadResult, WriteResult, Props>,
    ) => WriteDocsToDocs<WriteResult, Props>;
  }

  /**
   * The transaction body function type.
   */
  export type WriteFunction<
    Schema extends Core.PlainSchema,
    ReadResult,
    WriteResult,
    Props extends Core.DocProps,
  > = ($: WriteHelpers<Schema, ReadResult, Props>) => WriteResult;

  export type ReadDB<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps,
    BasePath extends string | false = false,
  > = {
    [Name in keyof Schema]: Name extends string
      ? Schema[Name] extends Core.NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId,
          infer CustomName
        >
        ? NestedReadCollection<
            {
              Model: Model;
              Name: CustomName extends string ? CustomName : Name;
              Id: CustomId extends Core.Id<any> | string
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Name>>;
              WideModel: Model;
              Flags: Core.DocDefFlags;
            },
            Props,
            ReadDB<Schema, Props, Utils.ComposePath<BasePath, Name>>
          >
        : Schema[Name] extends Core.PlainCollection<
              infer Model,
              infer CustomId,
              infer CustomName
            >
          ? ReadCollection<
              {
                Model: Model;
                Name: CustomName extends string ? CustomName : Name;
                Id: CustomId extends Core.Id<any> | string
                  ? CustomId
                  : Core.Id<Utils.ComposePath<BasePath, Name>>;
                WideModel: Model;
                Flags: Core.DocDefFlags;
              },
              Props
            >
          : never
      : never;
  };

  export type WriteDocsToDocs<
    Result,
    Props extends Core.DocProps,
  > = Result extends WriteDoc<infer Def, Props>
    ? Core.Doc<Def, Props>
    : Result extends WriteRef<infer Def, Props>
      ? Core.Ref<Def>
      : Result extends object
        ? { [Key in keyof Result]: WriteDocsToDocs<Result[Key], Props> }
        : Result;

  export type WriteDB<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps,
    BasePath extends string | false = false,
  > = {
    [Name in keyof Schema]: Name extends string
      ? Schema[Name] extends Core.NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId,
          infer CustomName
        >
        ? NestedWriteCollection<
            {
              Model: Model;
              Name: CustomName extends string ? CustomName : Name;
              Id: CustomId extends Core.Id<any> | string
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Name>>;
              WideModel: Model;
              Flags: Core.DocDefFlags;
            },
            Props,
            WriteDB<Schema, Props, Utils.ComposePath<BasePath, Name>>
          >
        : Schema[Name] extends Core.PlainCollection<
              infer Model,
              infer CustomId,
              infer CustomName
            >
          ? WriteCollection<
              {
                Model: Model;
                Name: CustomName extends string ? CustomName : Name;
                Id: CustomId extends Core.Id<any> | string
                  ? CustomId
                  : Core.Id<Utils.ComposePath<BasePath, Name>>;
                WideModel: Model;
                Flags: Core.DocDefFlags;
              },
              Props
            >
          : never
      : never;
  };
}
