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
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    type: 'ref'
    collection: ReadCollection<ModelPair, Environment>
    id: ModelPair[1]
  }

  /**
   * The document reference type.
   */
  export interface WriteRef<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends DocAPI<ModelPair, Environment> {
    type: 'ref'
    collection: WriteCollection<ModelPair, Environment>
    id: ModelPair[1]
  }

  export type DocAPI<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = {
    set(data: Core.SetModelArg<ModelPair[0], Environment>): void

    update(data: Update.UpdateModelArg<ModelPair[0], Environment>): void

    upset(data: Core.SetModelArg<ModelPair[0], Environment>): void

    remove(): void
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type ReadDoc<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? ReadServerDoc<ModelPair>
    : Environment extends 'client'
    ? ReadClientDoc<ModelPair>
    : ReadServerDoc<ModelPair> | ReadClientDoc<ModelPair>

  export interface ReadServerDoc<ModelPair extends Core.ModelIdPair> {
    type: 'doc'
    ref: ReadRef<ModelPair, 'server'>
    data: Core.ModelNodeData<ModelPair[0]>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ReadClientDoc<ModelPair extends Core.ModelIdPair> {
    type: 'doc'
    ref: ReadRef<ModelPair, 'client'>
    data: Core.AnyModelData<ModelPair[0], 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type WriteDoc<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? WriteServerDoc<ModelPair>
    : Environment extends 'client'
    ? WriteClientDoc<ModelPair>
    : WriteServerDoc<ModelPair> | WriteClientDoc<ModelPair>

  export interface WriteServerDoc<ModelPair extends Core.ModelIdPair>
    extends DocAPI<ModelPair, 'server'> {
    type: 'doc'
    ref: WriteRef<ModelPair, 'server'>
    data: Core.ModelNodeData<ModelPair[0]>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface WriteClientDoc<ModelPair extends Core.ModelIdPair>
    extends DocAPI<ModelPair, 'client'> {
    type: 'doc'
    ref: WriteRef<ModelPair, 'client'>
    data: Core.AnyModelData<ModelPair[0], 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export type AnyWriteCollection<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > =
    | WriteCollection<ModelPair, Environment>
    | NestedWriteCollection<ModelPair, WriteSchema<Environment>, Environment>

  export interface WriteSchema<
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyWriteCollection<Core.ModelIdPair, Environment>
  }

  export interface NestedWriteCollection<
    ModelPair extends Core.ModelIdPair,
    NestedSchema extends WriteSchema<Environment>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends WriteCollection<ModelPair, Environment> {
    (id: ModelPair[1]): NestedSchema
  }

  /**
   *
   */
  export interface WriteCollection<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Core.PlainCollection<ModelPair> {
    /** The Firestore path */
    path: string

    set(
      id: ModelPair[1],
      data: Core.SetModelArg<ModelPair[0], Environment>
    ): void

    upset(
      id: ModelPair[1],
      data: Core.SetModelArg<ModelPair[0], Environment>
    ): void

    update(
      id: ModelPair[1],
      data: Update.UpdateModelArg<ModelPair[0], Environment>
    ): void

    remove(id: ModelPair[1]): void
  }

  export type AnyReadCollection<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > =
    | ReadCollection<ModelPair, Environment>
    | NestedReadCollection<ModelPair, ReadSchema<Environment>, Environment>

  export interface ReadSchema<
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyReadCollection<Core.ModelIdPair, Environment>
  }

  export interface NestedReadCollection<
    ModelPair extends Core.ModelIdPair,
    NestedSchema extends ReadSchema<Environment>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends ReadCollection<ModelPair, Environment> {
    (id: ModelPair[1]): NestedSchema
  }

  export interface ReadCollection<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Core.PlainCollection<ModelPair> {
    /** The Firestore path */
    path: string

    get(id: ModelPair[1]): Promise<ReadDoc<ModelPair, Environment> | null>
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
            [
              Model,
              CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
            ],
            ReadDB<Schema, Environment>,
            Environment
          >
        : Schema[Path] extends Core.PlainCollection<infer Model, infer CustomId>
        ? ReadCollection<
            [
              Model,
              CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
            ],
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
            [
              Model,
              CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
            ],
            WriteDB<Schema, Environment>,
            Environment
          >
        : Schema[Path] extends Core.PlainCollection<infer Model, infer CustomId>
        ? WriteCollection<
            [
              Model,
              CustomId extends Core.Id<any>
                ? CustomId
                : Core.Id<Utils.ComposePath<BasePath, Path>>
            ],
            Environment
          >
        : never
      : never
  }
}
