import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusCore as Core } from './core'
import type { TypesaurusUpdate as Update } from './update'

export namespace TypesaurusTransaction {
  export interface Function {
    <
      Schema extends Core.PlainSchema,
      Environment extends Core.RuntimeEnvironment | undefined = undefined
    >(
      db: Core.DB<Schema>,
      options?: Core.OperationOptions<Environment>
    ): ReadChain<Schema, Environment>
  }

  /**
   * The document reference type.
   */
  export interface ReadRef<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    type: 'ref'
    collection: ReadCollection<Def, Environment>
    id: Def['Id']
  }

  /**
   * The document reference type.
   */
  export interface WriteRef<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends DocAPI<Def, Environment> {
    type: 'ref'
    collection: WriteCollection<Def, Environment>
    id: Def['Id']
  }

  export type DocAPI<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = {
    set(data: Core.SetModelArg<Def['Model'], Environment>): void

    update(data: Update.UpdateModelArg<Def['Model'], Environment>): void

    upset(data: Core.SetModelArg<Def['Model'], Environment>): void

    remove(): void
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type ReadDoc<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? ReadServerDoc<Def>
    : Environment extends 'client'
    ? ReadClientDoc<Def>
    : ReadServerDoc<Def> | ReadClientDoc<Def>

  export interface ReadServerDoc<Def extends Core.DocDef> {
    type: 'doc'
    ref: ReadRef<Def, 'server'>
    data: Core.ModelNodeData<Def['Model']>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ReadClientDoc<Def extends Core.DocDef> {
    type: 'doc'
    ref: ReadRef<Def, 'client'>
    data: Core.AnyModelData<Def['Model'], 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type WriteDoc<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? WriteServerDoc<Def>
    : Environment extends 'client'
    ? WriteClientDoc<Def>
    : WriteServerDoc<Def> | WriteClientDoc<Def>

  export interface WriteServerDoc<Def extends Core.DocDef>
    extends DocAPI<Def, 'server'> {
    type: 'doc'
    ref: WriteRef<Def, 'server'>
    data: Core.ModelNodeData<Def['Model']>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface WriteClientDoc<Def extends Core.DocDef>
    extends DocAPI<Def, 'client'> {
    type: 'doc'
    ref: WriteRef<Def, 'client'>
    data: Core.AnyModelData<Def['Model'], 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export type AnyWriteCollection<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > =
    | WriteCollection<Def, Environment>
    | NestedWriteCollection<Def, WriteSchema<Environment>, Environment>

  export interface WriteSchema<
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyWriteCollection<Core.DocDef, Environment>
  }

  export interface NestedWriteCollection<
    Def extends Core.DocDef,
    NestedSchema extends WriteSchema<Environment>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends WriteCollection<Def, Environment> {
    (id: Def['Id']): NestedSchema
  }

  /**
   *
   */
  export interface WriteCollection<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Core.PlainCollection<Def> {
    /** The Firestore path */
    path: string

    set(id: Def['Id'], data: Core.SetModelArg<Def['Model'], Environment>): void

    upset(
      id: Def['Id'],
      data: Core.SetModelArg<Def['Model'], Environment>
    ): void

    update(
      id: Def['Id'],
      data: Update.UpdateModelArg<Def['Model'], Environment>
    ): void

    remove(id: Def['Id']): void
  }

  export type AnyReadCollection<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > =
    | ReadCollection<Def, Environment>
    | NestedReadCollection<Def, ReadSchema<Environment>, Environment>

  export interface ReadSchema<
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyReadCollection<Core.DocDef, Environment>
  }

  export interface NestedReadCollection<
    Def extends Core.DocDef,
    NestedSchema extends ReadSchema<Environment>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends ReadCollection<Def, Environment> {
    (id: Def['Id']): NestedSchema
  }

  export interface ReadCollection<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Core.PlainCollection<Def> {
    /** The Firestore path */
    path: string

    get(id: Def['Id']): Promise<ReadDoc<Def, Environment> | null>
  }

  /**
   * The transaction read API object. It contains {@link ReadHelpers.get|get}
   * the function that allows reading documents from the database.
   */
  export interface ReadHelpers<
    Schema extends Core.PlainSchema,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    db: ReadDB<Schema, Environment>
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
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    /** The result of the read function. */
    data: ReadDocsToWriteDocs<ReadResult>

    db: WriteDB<Schema, Environment>
  }

  export type ReadDocsToWriteDocs<
    Result,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = Result extends ReadDoc<infer Model, Environment>
    ? WriteDoc<Model, Environment>
    : Result extends Record<any, unknown> | Array<unknown>
    ? { [Key in keyof Result]: ReadDocsToWriteDocs<Result[Key], Environment> }
    : Result

  export interface ReadChain<
    Schema extends Core.PlainSchema,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    read: <ReadResult>(
      callback: ReadFunction<Schema, ReadResult, Environment>
    ) => WriteChain<Schema, ReadResult, Environment>
  }

  /**
   * The transaction body function type.
   */
  export type ReadFunction<
    Schema extends Core.PlainSchema,
    ReadResult,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = ($: ReadHelpers<Schema, Environment>) => Promise<ReadResult>

  export interface WriteChain<
    Schema extends Core.PlainSchema,
    ReadResult,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    write: <WriteResult>(
      callback: WriteFunction<Schema, ReadResult, WriteResult, Environment>
    ) => WriteResult
  }

  /**
   * The transaction body function type.
   */
  export type WriteFunction<
    Schema extends Core.PlainSchema,
    ReadResult,
    WriteResult,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = ($: WriteHelpers<Schema, ReadResult, Environment>) => WriteResult

  export type ReadDB<
    Schema extends Core.PlainSchema,
    Environment extends Core.RuntimeEnvironment | undefined = undefined,
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
              Id: CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            ReadDB<Schema, Environment>,
            Environment
          >
        : Schema[Path] extends Core.PlainCollection<infer Model, infer CustomId>
        ? ReadCollection<
            {
              Model: Model
              Id: CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            Environment
          >
        : never
      : never
  }

  export type WriteDB<
    Schema extends Core.PlainSchema,
    Environment extends Core.RuntimeEnvironment | undefined = undefined,
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
              Id: CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            WriteDB<Schema, Environment>,
            Environment
          >
        : Schema[Path] extends Core.PlainCollection<infer Model, infer CustomId>
        ? WriteCollection<
            {
              Model: Model
              Id: CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: Core.DocDefFlags
            },
            Environment
          >
        : never
      : never
  }
}
