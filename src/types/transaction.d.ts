import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusCore as Core } from './core'
import type { TypesaurusUpdate as Update } from './update'

export namespace TypesaurusTransaction {
  export interface Function {
    <
      Schema extends Core.PlainSchema,
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment }
    >(
      db: Core.DB<Schema>,
      options?: Core.OperationOptions<Environment>
    ): ReadChain<Schema, Props>
  }

  /**
   * The document reference type.
   */
  export interface ReadRef<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > {
    type: 'ref'
    collection: ReadCollection<Def, Props>
    id: Def['Id']
  }

  /**
   * The document reference type.
   */
  export interface WriteRef<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > extends DocAPI<Def, Props> {
    type: 'ref'
    collection: WriteCollection<Def, Props>
    id: Def['Id']
  }

  export interface DocAPI<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > {
    set(data: Core.WriteArg<Core.ResolveModelType<Def['Model']>, Props>): void

    update(
      data: Update.Arg<
        Def['Flags']['Reduced'] extends true
          ? Core.ResolveModelType<Def['Model']>
          : Core.SharedModelType<Def['WideModel']>,
        Props
      >
    ): void

    upset(data: Core.WriteArg<Core.ResolveModelType<Def['Model']>, Props>): void

    remove(): void
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface ReadDoc<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > {
    type: 'doc'
    ref: ReadRef<Def, Props>
    data: Props['environment'] extends 'server'
      ? Core.ServerData<Core.ResolveModelType<Def['Model']>>
      : Core.Data<Core.ResolveModelType<Def['Model']>, 'present'>
    props: Props
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface WriteDoc<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > extends DocAPI<Def, Props> {
    type: 'doc'
    ref: WriteRef<Def, Props>
    data: Props['environment'] extends 'server'
      ? Core.ServerData<Core.ResolveModelType<Def['Model']>>
      : Core.Data<Core.ResolveModelType<Def['Model']>, 'present'>
    props: Props

    narrow<NarrowToModel extends Core.ModelType>(
      fn: Core.DocNarrowFunction<
        Core.ResolveModelType<Def['WideModel']>,
        NarrowToModel
      >
    ):
      | WriteDoc<
          {
            Model: NarrowToModel
            Id: Def['Id']
            WideModel: Def['WideModel']
            Flags: Def['Flags'] & { Reduced: true }
          },
          Props
        >
      | undefined
  }

  export type AnyWriteCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > =
    | WriteCollection<Def, Props>
    | NestedWriteCollection<Def, Props, WriteSchema<Props>>

  export interface WriteSchema<Props extends Core.DocProps> {
    [CollectionPath: string]: AnyWriteCollection<Core.DocDef, Props>
  }

  export interface NestedWriteCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
    NestedSchema extends WriteSchema<Props>
  > extends WriteCollection<Def, Props> {
    (id: Def['Id']): NestedSchema
  }

  /**
   *
   */
  export interface WriteCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > extends Core.PlainCollection<Def> {
    /** The Firestore path */
    path: string

    set(
      id: Def['Id'],
      data: Core.WriteArg<Core.ResolveModelType<Def['Model']>, Props>
    ): void

    upset(
      id: Def['Id'],
      data: Core.WriteArg<Core.ResolveModelType<Def['Model']>, Props>
    ): void

    update(
      id: Def['Id'],
      data: Update.Arg<Core.SharedModelType<Def['WideModel']>, Props>
    ): void

    remove(id: Def['Id']): void
  }

  export type AnyReadCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > =
    | ReadCollection<Def, Props>
    | NestedReadCollection<Def, Props, ReadSchema<Props>>

  export interface ReadSchema<Props extends Core.DocProps> {
    [CollectionPath: string]: AnyReadCollection<Core.DocDef, Props>
  }

  export interface NestedReadCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
    NestedSchema extends ReadSchema<Props>
  > extends ReadCollection<Def, Props> {
    (id: Def['Id']): NestedSchema
  }

  export interface ReadCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > extends Core.PlainCollection<Def> {
    /** The Firestore path */
    path: string

    get(id: Def['Id']): Promise<ReadDoc<Def, Props> | null>
  }

  /**
   * The transaction read API object. It contains {@link ReadHelpers.get|get}
   * the function that allows reading documents from the database.
   */
  export interface ReadHelpers<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps
  > {
    db: ReadDB<Schema, Props>
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
    Props extends Core.DocProps
  > {
    /** The result of the read function. */
    result: ReadDocsToWriteDocs<ReadResult, Props>

    db: WriteDB<Schema, Props>
  }

  export type ReadDocsToWriteDocs<
    Result,
    Props extends Core.DocProps
  > = Result extends ReadDoc<infer Model, Props>
    ? WriteDoc<Model, Props>
    : Result extends Record<any, unknown> | Array<unknown>
    ? { [Key in keyof Result]: ReadDocsToWriteDocs<Result[Key], Props> }
    : Result

  export interface ReadChain<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps
  > {
    read: <ReadResult>(
      callback: ReadFunction<Schema, ReadResult, Props>
    ) => WriteChain<Schema, ReadResult, Props>
  }

  /**
   * The transaction body function type.
   */
  export type ReadFunction<
    Schema extends Core.PlainSchema,
    ReadResult,
    Props extends Core.DocProps
  > = ($: ReadHelpers<Schema, Props>) => Promise<ReadResult>

  export interface WriteChain<
    Schema extends Core.PlainSchema,
    ReadResult,
    Props extends Core.DocProps
  > {
    write: <WriteResult>(
      callback: WriteFunction<Schema, ReadResult, WriteResult, Props>
    ) => WriteResult
  }

  /**
   * The transaction body function type.
   */
  export type WriteFunction<
    Schema extends Core.PlainSchema,
    ReadResult,
    WriteResult,
    Props extends Core.DocProps
  > = ($: WriteHelpers<Schema, ReadResult, Props>) => WriteResult

  export type ReadDB<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps,
    BasePath extends string | undefined = undefined
  > = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends Core.NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId
        >
        ? NestedReadCollection<
            {
              Model: Model
              Id: CustomId extends Core.Id<any> | string
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            Props,
            ReadDB<Schema, Props, Utils.ComposePath<BasePath, Path>>
          >
        : Schema[Path] extends Core.PlainCollection<infer Model, infer CustomId>
        ? ReadCollection<
            {
              Model: Model
              Id: CustomId extends Core.Id<any> | string
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            Props
          >
        : never
      : never
  }

  export type WriteDB<
    Schema extends Core.PlainSchema,
    Props extends Core.DocProps,
    BasePath extends string | undefined = undefined
  > = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends Core.NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId
        >
        ? NestedWriteCollection<
            {
              Model: Model
              Id: CustomId extends Core.Id<any> | string
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            Props,
            WriteDB<Schema, Props, Utils.ComposePath<BasePath, Path>>
          >
        : Schema[Path] extends Core.PlainCollection<infer Model, infer CustomId>
        ? WriteCollection<
            {
              Model: Model
              Id: CustomId extends Core.Id<any> | string
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            Props
          >
        : never
      : never
  }
}
