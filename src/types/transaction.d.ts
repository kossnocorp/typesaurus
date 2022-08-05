import type { Typesaurus } from '..'

export namespace TypesaurusTransaction {
  /**
   * The document reference type.
   */
  export interface Ref<Model, Environment extends Typesaurus.RuntimeEnvironment>
    extends DocAPI<Model, Environment> {
    type: 'ref'
    collection: WriteCollection<Model, Environment>
    id: string
  }

  export type DocAPI<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment
  > = {
    set(data: Typesaurus.WriteModelArg<Model, Environment>): void

    update(data: Typesaurus.UpdateModelArg<Model, Environment>): void

    upset(data: Typesaurus.WriteModelArg<Model, Environment>): void

    remove(): void
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type Doc<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server' ? ServerDoc<Model> : ClientDoc<Model>

  export interface ServerDoc<Model> extends DocAPI<Model, 'server'> {
    type: 'doc'
    ref: Ref<Model, 'server'>
    data: Typesaurus.ModelNodeData<Model>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ClientDoc<Model> extends DocAPI<Model, 'client'> {
    type: 'doc'
    ref: Ref<Model, 'client'>
    data: Typesaurus.AnyModelData<Model, 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export type AnyWriteCollection<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > =
    | WriteCollection<Model, Environment>
    | NestedWriteCollection<Model, WriteSchema<Environment>, Environment>

  export interface WriteSchema<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyWriteCollection<unknown, Environment>
  }

  export interface NestedWriteCollection<
    Model,
    NestedSchema extends WriteSchema<Environment>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends WriteCollection<Model, Environment> {
    (id: string): NestedSchema
  }

  /**
   *
   */
  export interface WriteCollection<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Typesaurus.PlainCollection<Model> {
    /** The Firestore path */
    path: string

    add(data: Typesaurus.WriteModelArg<Model, Environment>): void

    set(id: string, data: Typesaurus.WriteModelArg<Model, Environment>): void

    upset(id: string, data: Typesaurus.WriteModelArg<Model, Environment>): void

    update(
      id: string,
      data: Typesaurus.UpdateModelArg<Model, Environment>
    ): void

    remove(id: string): void
  }

  export type AnyReadCollection<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > =
    | ReadCollection<Model, Environment>
    | NestedReadCollection<Model, ReadSchema<Environment>, Environment>

  export interface ReadSchema<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyReadCollection<unknown, Environment>
  }

  export interface NestedReadCollection<
    Model,
    NestedSchema extends ReadSchema<Environment>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends ReadCollection<Model, Environment> {
    (id: string): NestedSchema
  }

  export interface ReadCollection<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Typesaurus.PlainCollection<Model> {
    /** The Firestore path */
    path: string

    get(id: string): Promise<Doc<Model, Environment> | null>
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
    data: ReadResult

    db: WriteDB<Schema, Environment>
  }

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

  export interface Function {
    <
      Schema extends Typesaurus.PlainSchema,
      Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
    >(
      db: Typesaurus.RootDB<Schema>,
      options?: Typesaurus.OperationOptions<Environment>
    ): ReadChain<Schema, Environment>

    // <ReadResult, Environment extends Typesaurus.RuntimeEnvironment>(
    //   callback: ReadFunction<ReadResult, Environment>,
    //   options?: Typesaurus.OperationOptions<Environment>
    // ): WriteChain<ReadResult, Environment>
  }

  export type ReadDB<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = {
    [Path in keyof Schema]: Schema[Path] extends Typesaurus.NestedPlainCollection<
      infer Model,
      infer Schema
    >
      ? NestedReadCollection<Model, ReadDB<Schema, Environment>, Environment>
      : Schema[Path] extends Typesaurus.PlainCollection<infer Model>
      ? ReadCollection<Model, Environment>
      : never
  }

  export type WriteDB<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = {
    [Path in keyof Schema]: Schema[Path] extends Typesaurus.NestedPlainCollection<
      infer Model,
      infer Schema
    >
      ? NestedWriteCollection<Model, WriteDB<Schema, Environment>, Environment>
      : Schema[Path] extends Typesaurus.PlainCollection<infer Model>
      ? WriteCollection<Model, Environment>
      : never
  }
}
