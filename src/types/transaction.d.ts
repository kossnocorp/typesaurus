import type { Typesaurus } from './typesaurus'
import type { TypesaurusUtils } from '../utils'

export namespace TypesaurusTransaction {
  export interface Function {
    <
      Schema extends Typesaurus.PlainSchema,
      Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
    >(
      db: Typesaurus.DB<Schema>,
      options?: Typesaurus.OperationOptions<Environment>
    ): ReadChain<Schema, Environment>
  }

  /**
   * The document reference type.
   */
  export interface ReadRef<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    type: 'ref'
    collection: ReadCollection<ModelPair, Environment>
    id: Typesaurus.Id<ModelPair[1] /* Path */>
  }

  /**
   * The document reference type.
   */
  export interface WriteRef<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends DocAPI<ModelPair, Environment> {
    type: 'ref'
    collection: WriteCollection<ModelPair, Environment>
    id: Typesaurus.Id<ModelPair[1] /* Path */>
  }

  export type DocAPI<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = {
    set(
      data: Typesaurus.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    update(
      data: Typesaurus.UpdateModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    upset(
      data: Typesaurus.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    remove(): void
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type ReadDoc<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? ReadServerDoc<ModelPair>
    : Environment extends 'client'
    ? ReadClientDoc<ModelPair>
    : ReadServerDoc<ModelPair> | ReadClientDoc<ModelPair>

  export interface ReadServerDoc<ModelPair extends Typesaurus.ModelPathPair> {
    type: 'doc'
    ref: ReadRef<ModelPair, 'server'>
    data: Typesaurus.ModelNodeData<ModelPair[0] /* Model */>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ReadClientDoc<ModelPair extends Typesaurus.ModelPathPair> {
    type: 'doc'
    ref: ReadRef<ModelPair, 'client'>
    data: Typesaurus.AnyModelData<ModelPair[0] /* Model */, 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type WriteDoc<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? WriteServerDoc<ModelPair>
    : Environment extends 'client'
    ? WriteClientDoc<ModelPair>
    : WriteServerDoc<ModelPair> | WriteClientDoc<ModelPair>

  export interface WriteServerDoc<ModelPair extends Typesaurus.ModelPathPair>
    extends DocAPI<ModelPair, 'server'> {
    type: 'doc'
    ref: WriteRef<ModelPair, 'server'>
    data: Typesaurus.ModelNodeData<ModelPair[0] /* Model */>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface WriteClientDoc<ModelPair extends Typesaurus.ModelPathPair>
    extends DocAPI<ModelPair, 'client'> {
    type: 'doc'
    ref: WriteRef<ModelPair, 'client'>
    data: Typesaurus.AnyModelData<ModelPair[0] /* Model */, 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export type AnyWriteCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > =
    | WriteCollection<ModelPair, Environment>
    | NestedWriteCollection<ModelPair, WriteSchema<Environment>, Environment>

  export interface WriteSchema<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyWriteCollection<
      Typesaurus.ModelPathPair,
      Environment
    >
  }

  export interface NestedWriteCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    NestedSchema extends WriteSchema<Environment>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends WriteCollection<ModelPair, Environment> {
    (id: Typesaurus.Id<ModelPair[1] /* Path */>): NestedSchema
  }

  /**
   *
   */
  export interface WriteCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Typesaurus.PlainCollection<ModelPair> {
    /** The Firestore path */
    path: string

    set(
      id: Typesaurus.Id<ModelPair[1] /* Path */>,
      data: Typesaurus.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    upset(
      id: Typesaurus.Id<ModelPair[1] /* Path */>,
      data: Typesaurus.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    update(
      id: Typesaurus.Id<ModelPair[1] /* Path */>,
      data: Typesaurus.UpdateModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    remove(id: Typesaurus.Id<ModelPair[1] /* Path */>): void
  }

  export type AnyReadCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > =
    | ReadCollection<ModelPair, Environment>
    | NestedReadCollection<ModelPair, ReadSchema<Environment>, Environment>

  export interface ReadSchema<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyReadCollection<
      Typesaurus.ModelPathPair,
      Environment
    >
  }

  export interface NestedReadCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    NestedSchema extends ReadSchema<Environment>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends ReadCollection<ModelPair, Environment> {
    (id: Typesaurus.Id<ModelPair[1] /* Path */>): NestedSchema
  }

  export interface ReadCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Typesaurus.PlainCollection<ModelPair> {
    /** The Firestore path */
    path: string

    get(
      id: Typesaurus.Id<ModelPair[1] /* Path */>
    ): Promise<ReadDoc<ModelPair, Environment> | null>
  }

  /**
   * The transaction read API object. It contains {@link ReadHelpers.get|get}
   * the function that allows reading documents from the database.
   */
  export interface ReadHelpers<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
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
    Schema extends Typesaurus.PlainSchema,
    ReadResult,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    /** The result of the read function. */
    data: ReadDocsToWriteDocs<ReadResult>

    db: WriteDB<Schema, Environment>
  }

  export type ReadDocsToWriteDocs<
    Result,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = Result extends ReadDoc<infer Model, Environment>
    ? WriteDoc<Model, Environment>
    : Result extends Record<any, unknown> | Array<unknown>
    ? { [Key in keyof Result]: ReadDocsToWriteDocs<Result[Key], Environment> }
    : Result

  export interface ReadChain<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    read: <ReadResult>(
      callback: ReadFunction<Schema, ReadResult, Environment>
    ) => WriteChain<Schema, ReadResult, Environment>
  }

  /**
   * The transaction body function type.
   */
  export type ReadFunction<
    Schema extends Typesaurus.PlainSchema,
    ReadResult,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = ($: ReadHelpers<Schema, Environment>) => Promise<ReadResult>

  export interface WriteChain<
    Schema extends Typesaurus.PlainSchema,
    ReadResult,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    write: <WriteResult>(
      callback: WriteFunction<Schema, ReadResult, WriteResult, Environment>
    ) => WriteResult
  }

  /**
   * The transaction body function type.
   */
  export type WriteFunction<
    Schema extends Typesaurus.PlainSchema,
    ReadResult,
    WriteResult,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = ($: WriteHelpers<Schema, ReadResult, Environment>) => WriteResult

  export type ReadDB<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined,
    BasePath extends string | undefined = undefined
  > = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends Typesaurus.NestedPlainCollection<
          infer Model,
          infer Schema
        >
        ? NestedReadCollection<
            [Model, TypesaurusUtils.ComposePath<BasePath, Path>],
            ReadDB<Schema, Environment>,
            Environment
          >
        : Schema[Path] extends Typesaurus.PlainCollection<infer Model>
        ? ReadCollection<
            [Model, TypesaurusUtils.ComposePath<BasePath, Path>],
            Environment
          >
        : never
      : never
  }

  export type WriteDB<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined,
    BasePath extends string | undefined = undefined
  > = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends Typesaurus.NestedPlainCollection<
          infer Model,
          infer Schema
        >
        ? NestedWriteCollection<
            [Model, TypesaurusUtils.ComposePath<BasePath, Path>],
            WriteDB<Schema, Environment>,
            Environment
          >
        : Schema[Path] extends Typesaurus.PlainCollection<infer Model>
        ? WriteCollection<
            [Model, TypesaurusUtils.ComposePath<BasePath, Path>],
            Environment
          >
        : never
      : never
  }
}
