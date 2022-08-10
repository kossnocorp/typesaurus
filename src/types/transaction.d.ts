import type { Typesaurus } from '..'

export namespace TypesaurusTransaction {
  /**
   * The document reference type.
   */
  export interface ReadRef<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    type: 'ref'
    collection: ReadCollection<Model, Environment>
    id: string
  }

  /**
   * The document reference type.
   */
  export interface WriteRef<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends DocAPI<Model, Environment> {
    type: 'ref'
    collection: WriteCollection<Model, Environment>
    id: string
  }

  export type DocAPI<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = {
    set(data: Typesaurus.WriteModelArg<Model, Environment>): void

    update(data: Typesaurus.UpdateModelArg<Model, Environment>): void

    upset(data: Typesaurus.WriteModelArg<Model, Environment>): void

    remove(): void
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type ReadDoc<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? ReadServerDoc<Model>
    : Environment extends 'client'
    ? ReadClientDoc<Model>
    : ReadServerDoc<Model> | ReadClientDoc<Model>

  export interface ReadServerDoc<Model> {
    type: 'doc'
    ref: ReadRef<Model, 'server'>
    data: Typesaurus.ModelNodeData<Model>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ReadClientDoc<Model> {
    type: 'doc'
    ref: ReadRef<Model, 'client'>
    data: Typesaurus.AnyModelData<Model, 'present'>
    environment: 'web'
    source: 'database'
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type WriteDoc<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? WriteServerDoc<Model>
    : Environment extends 'client'
    ? WriteClientDoc<Model>
    : WriteServerDoc<Model> | WriteClientDoc<Model>

  export interface WriteServerDoc<Model> extends DocAPI<Model, 'server'> {
    type: 'doc'
    ref: WriteRef<Model, 'server'>
    data: Typesaurus.ModelNodeData<Model>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface WriteClientDoc<Model> extends DocAPI<Model, 'client'> {
    type: 'doc'
    ref: WriteRef<Model, 'client'>
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

    set(id: string, data: Typesaurus.WriteModelArg<Model, Environment>): void

    upset(id: string, data: Typesaurus.WriteModelArg<Model, Environment>): void

    update(
      id: string,
      data: Typesaurus.UpdateModelArg<Model, Environment>
    ): void

    remove(id: string): void

    // ref(id: string): WriteRef<Model, Environment>

    // doc(id: string, data: Model): WriteDoc<Model, Environment>
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

    get(id: string): Promise<ReadDoc<Model, Environment> | null>
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

  export interface Function {
    <
      Schema extends Typesaurus.PlainSchema,
      Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
    >(
      db: Typesaurus.DB<Schema>,
      options?: Typesaurus.OperationOptions<Environment>
    ): ReadChain<Schema, Environment>
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
