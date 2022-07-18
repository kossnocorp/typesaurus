import { firestore } from 'firebase-admin'

export namespace Typesaurus {
  class DocId {}

  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocChangeType = 'added' | 'removed' | 'modified'

  export interface DocumentMetaData {
    fromCache: boolean
    hasPendingWrites: boolean
  }

  export interface DocChange<Model> {
    /** The type of change. */
    readonly type: DocChangeType

    /** The document affected by this change. */
    readonly doc: PlainDoc<Model>

    /**
     * The index of the changed document in the result set immediately prior to
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange` objects
     * have been applied). Is -1 for 'added' events.
     */
    readonly oldIndex: number

    /**
     * The index of the changed document in the result set immediately after
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange`
     * objects and the current `DocumentChange` object have been applied).
     * Is -1 for 'removed' events.
     */
    readonly newIndex: number
  }

  /**
   * An options object that configures the snapshot contents of `onAll()` and `onQuery()`.
   */
  export interface SnapshotInfo<Model> {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<Model>[]

    /** The number of documents in the QuerySnapshot. */
    readonly size: number

    /** True if there are no documents in the QuerySnapshot. */
    readonly empty: boolean
  }

  export interface DocOptions<
    ServerTimestamps extends ServerTimestampsStrategy
  > {
    serverTimestamps?: ServerTimestamps
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type PlainDoc<Model> = AnyPlainDoc<
    Model,
    RuntimeEnvironment,
    boolean,
    ServerTimestampsStrategy
  >

  export type AnyPlainDoc<
    Model,
    Environment extends RuntimeEnvironment | undefined,
    FromCache extends boolean,
    ServerTimestamps extends ServerTimestampsStrategy
  > = Environment extends 'server'
    ? PlainServerDoc<Model>
    : FromCache extends false
    ? PlainClientDoc<Model, false, ServerTimestamps>
    : ServerTimestamps extends 'estimate'
    ? PlainClientDoc<Model, false, 'estimate'>
    : PlainClientDoc<Model, FromCache, ServerTimestamps>
  // NOTE: For some reason, FromCache and ServerTimestamps are not properly inferred:
  // Environment extends 'server'
  //   ? NodeDoc<Model>
  //   : WebDoc<Model, FromCache, ServerTimestamps>

  export interface PlainServerDoc<Model> {
    type: 'doc'
    ref: PlainRef<Model>
    data: ModelNodeData<Model>
    environment: 'server'
    fromCache?: false
    hasPendingWrites?: false
    serverTimestamps?: undefined
    firestoreData?: boolean
  }

  export interface PlainClientDoc<
    Model,
    FromCache extends boolean,
    ServerTimestamps extends ServerTimestampsStrategy
  > {
    type: 'doc'
    ref: PlainRef<Model>
    data: FromCache extends false
      ? AnyModelData<Model, false>
      : ServerTimestamps extends 'estimate'
      ? AnyModelData<Model, false>
      : AnyModelData<Model, true>
    environment: 'web'
    fromCache: FromCache
    hasPendingWrites: boolean
    serverTimestamps: ServerTimestamps
    firestoreData?: boolean
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type RichDoc<Model> = AnyRichDoc<
    Model,
    RuntimeEnvironment,
    boolean,
    ServerTimestampsStrategy
  >

  export type AnyRichDoc<
    Model,
    Environment extends RuntimeEnvironment | undefined,
    FromCache extends boolean,
    ServerTimestamps extends ServerTimestampsStrategy
  > = AnyPlainDoc<Model, Environment, FromCache, ServerTimestamps> &
    DocAPI<Model>

  export interface RichServerDoc<Model>
    extends PlainServerDoc<Model>,
      DocAPI<Model> {}

  export interface RichClientDoc<
    Model,
    FromCache extends boolean,
    ServerTimestamps extends ServerTimestampsStrategy
  > extends PlainClientDoc<Model, FromCache, ServerTimestamps>,
      DocAPI<Model> {}

  export type ModelNodeData<Model> = AnyModelData<Model, false>

  // NOTE: For some reason this won't work: AnyModelData<Model, boolean>
  export type ModelData<Model> =
    | AnyModelData<Model, true>
    | AnyModelData<Model, false>

  export type AnyModelData<Model, ServerDateNullable extends boolean> = {
    [Key in keyof Model]: ModelField<Model[Key], ServerDateNullable>
  }

  type ModelField<
    Field,
    ServerDateNullable extends boolean
  > = Field extends ServerDate // Process server dates
    ? ServerDateNullable extends true
      ? Date | null
      : Date
    : Field extends Date // Stop dates from being processed as an object
    ? Field
    : Field extends object // If it's an object, recursively pass through ModelData
    ? AnyModelData<Field, ServerDateNullable>
    : Field

  export type ResolvedServerDate<
    Environment extends RuntimeEnvironment | undefined,
    FromCache extends boolean,
    ServerTimestamps extends ServerTimestampsStrategy
  > = Environment extends 'server' // In node environment server dates are always defined
    ? Date
    : ResolvedWebServerDate<FromCache, ServerTimestamps>

  export type ResolvedWebServerDate<
    FromCache extends boolean,
    ServerTimestamps extends ServerTimestampsStrategy
  > = FromCache extends false | undefined // Server date is always defined when not from cache
    ? Date
    : ServerTimestamps extends 'estimate' // Or when the estimate strategy were used
    ? Date
    : Date | null

  /**
   * The document reference type.
   */
  export interface PlainRef<Model> {
    __type__: 'ref'
    collection: PlainCollection<Model>
    id: string
  }

  /**
   * The document reference type with Typesaurus document API.
   */
  export interface RichRef<Model> extends PlainRef<Model>, DocAPI<Model> {
    collection: RichCollection<
      Model,
      firestore.WhereFilterOp,
      firestore.OrderByDirection
    >
  }

  export type ServerTimestampsStrategy = 'estimate' | 'previous' | 'none'

  export type RuntimeEnvironment = 'server' | 'client'

  export interface ServerDate extends Date {
    __dontUseWillBeUndefined__: true
  }

  /**
   * Type of the data passed to add and set functions. It extends the model
   * allowing to set server date field value.
   */
  export type WriteModel<
    Model,
    Environment extends RuntimeEnvironment | undefined
  > = {
    [Key in keyof Model]:
      | (Exclude<Model[Key], undefined> extends ServerDate // First, ensure ServerDate is properly set
          ? Environment extends 'server' // Date can be used only in the server environment
            ? Date | ValueServerDate
            : ValueServerDate
          : Model[Key] extends object // If it's an object, recursively pass through SetModel
          ? WriteModel<Model[Key], Environment>
          : Model[Key])
      | WriteValue<Model[Key]>
  }

  /**
   * The value types to use for set operation.
   */
  export type WriteValue<Type> = Type extends ServerDate
    ? ValueServerDate
    : never

  /**
   * Type of the data passed to the update function. It extends the model
   * making values optional and allow to set value object.
   */
  export type UpdateModel<Model> = {
    [Key in keyof Model]?: UpdateModel<Model[Key]> | UpdateValue<Model, Key>
  }

  /**
   *
   */
  export type UpdateFields<Model> = UpdateField<Model>[]

  /**
   *
   */
  export type UpdateField<Model> = []

  /**
   * The value types to use for update operation.
   */
  export type UpdateValue<Model, Key> = Key extends keyof Model
    ? Model[Key] extends infer Type
      ? Type extends number
        ? MaybeValueRemoveOr<Model, Key, ValueIncrement>
        : Type extends Array<any>
        ? MaybeValueRemoveOr<Model, Key, ValueArrayUnion | ValueArrayRemove>
        : Type extends Date
        ? MaybeValueRemoveOr<Model, Key, ValueServerDate>
        : MaybeValueRemove<Model, Key>
      : never
    : never

  /**
   * The value types to use for upset operation.
   */
  export type UpsetValue<T> = T extends number
    ? ValueIncrement
    : T extends Array<any>
    ? ValueArrayUnion | ValueArrayRemove
    : T extends ServerDate
    ? ValueServerDate
    : never

  /**
   * Available value kinds.
   */
  export type ValueKind =
    | 'remove'
    | 'increment'
    | 'arrayUnion'
    | 'arrayRemove'
    | 'serverDate'

  /**
   * The remove value type.
   */
  export interface ValueRemove {
    __type__: 'value'
    kind: 'remove'
  }

  /**
   * The increment value type. It holds the increment value.
   */
  export interface ValueIncrement {
    __type__: 'value'
    kind: 'increment'
    number: number
  }

  /**
   * The array union value type. It holds the payload to union.
   */
  export interface ValueArrayUnion {
    __type__: 'value'
    kind: 'arrayUnion'
    values: any[]
  }

  /**
   * The array remove value type. It holds the data to remove from the target array.
   */
  export interface ValueArrayRemove {
    __type__: 'value'
    kind: 'arrayRemove'
    values: any[]
  }

  /**
   * The server date value type.
   */
  export interface ValueServerDate {
    __type__: 'value'
    kind: 'serverDate'
  }

  export type MaybeValueRemoveOr<
    Model,
    Key extends keyof Model,
    ValueType
  > = Partial<Pick<Model, Key>> extends Pick<Model, Key>
    ? ValueRemove | ValueType
    : ValueType

  export type MaybeValueRemove<Model, Key extends keyof Model> = Partial<
    Pick<Model, Key>
  > extends Pick<Model, Key>
    ? ValueRemove
    : Undefined<Model[Key]> extends Model[Key]
    ? ValueRemove
    : never

  export type Undefined<T> = T extends undefined ? T : never

  /**
   * The query type.
   */
  export type Query<
    Model,
    Key extends keyof Model,
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > =
    | OrderQuery<Model, Key, FirestoreOrderByDirection>
    | WhereQuery<Model, FirestoreWhereFilterOp>
    | LimitQuery

  /**
   * The order query type. Used to build query.
   */
  export interface OrderQuery<
    Model,
    Key extends keyof Model,
    FirestoreOrderByDirection
  > {
    type: 'order'
    field: Key | DocId
    method: FirestoreOrderByDirection
    cursors: Cursor<Model, Key>[] | undefined
  }

  export interface WhereQuery<_Model, FirestoreWhereFilterOp> {
    type: 'where'
    field: string | string[] | DocId
    filter: FirestoreWhereFilterOp
    value: any
  }

  /**
   * The limit query type. It contains the limit value.
   */
  export interface LimitQuery {
    type: 'limit'
    number: number
  }

  /**
   * Available cursor methods.
   */
  export type CursorMethod = 'startAfter' | 'startAt' | 'endBefore' | 'endAt'

  /**
   * The cursor interface, holds the method and the value for pagination.
   */
  export interface Cursor<Model, Key extends keyof Model> {
    method: CursorMethod
    value: Model[Key] | PlainDoc<Model> | DocId | undefined
  }

  export interface QueryHelpers<
    Model,
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > {
    where<Key extends keyof Model>(
      key: Key,
      filter: FirestoreWhereFilterOp,
      value: Model[Key]
    ): WhereQuery<Model[Key], FirestoreWhereFilterOp>

    where<Key1 extends keyof Model, Key2 extends keyof Model[Key1]>(
      field: [Key1, Key2],
      filter: FirestoreWhereFilterOp,
      value: Model[Key1][Key2]
    ): WhereQuery<Model[Key1], FirestoreWhereFilterOp>

    order<Key extends keyof Model>(
      key: Key
    ): OrderQuery<Model, Key, FirestoreOrderByDirection>

    limit(to: number): LimitQuery
  }

  export interface WriteHelpers<Model> {
    serverDate: () => ValueServerDate
  }

  export interface SchemaHelpers {
    sub<Model, Schema extends PlainSchema>(
      collection: PlainCollection<Model>,
      schema: Schema
    ): NestedPlainCollection<Model, Schema>

    collection<Model>(): Typesaurus.PlainCollection<Model>
  }

  export interface OperationOptions<
    Environment extends RuntimeEnvironment | undefined
  > {
    as?: Environment
  }

  export type SubscriptionErrorCallback = (error: unknown) => any

  export type OffSubscription = () => void

  export interface OffSubscriptionWithCatch {
    (): void
    catch(callback: SubscriptionErrorCallback): OffSubscription
  }

  export type GetSubscriptionCallback<Model> = {
    (result: PlainDoc<Model> | null /*, info: SnapshotInfo<Model> */): void
  }

  export interface PromiseWithGetSubscription<Model>
    extends Promise<PlainDoc<Model> | null> {
    on(callback: GetSubscriptionCallback<Model>): OffSubscriptionWithCatch
  }

  export type ListSubscriptionCallback<Model> = {
    (result: PlainDoc<Model>[]): void
  }

  export interface PromiseWithListSubscription<Model>
    extends Promise<PlainDoc<Model>[]> {
    on(callback: ListSubscriptionCallback<Model>): OffSubscriptionWithCatch
  }

  export interface DocAPI<Model> {
    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: ($: WriteHelpers<Model>) => WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: UpdateModel<Model>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: ($: WriteHelpers<Model>) => UpdateModel<Model>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: UpdateModel<Model>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: ($: WriteHelpers<Model>) => WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    remove(): Promise<void>
  }

  export interface TransactionReadAPI<
    Model,
    Environment extends RuntimeEnvironment | undefined
  > {
    /**
     * Retrieves a document from a collection.
     *
     * ```ts
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   //=> { __type__: 'doc', data: { count: 42 }, ... }
     *   ({ data: counter, set }) =>
     *     set(counter.ref, { count: counter.data.count + 1 })
     * )
     * ```
     *
     * @returns Promise to the document or null if not found
     *
     * @param ref - The reference to the document
     */
    get<ServerTimestamps extends ServerTimestampsStrategy>(
      id: string,
      options?: DocOptions<ServerTimestamps>
    ): Promise<AnyPlainDoc<
      Model,
      Environment,
      boolean,
      ServerTimestamps
    > | null>
  }

  /**
   * The transaction read API object. It contains {@link TransactionReadHelpers.get|get}
   * the function that allows reading documents from the database.
   */
  export interface TransactionReadHelpers<
    Environment extends RuntimeEnvironment
  > {
    execute<Model>(
      collection: AnyRichCollection<Model, unknown>
    ): TransactionReadAPI<Model, Environment>
  }

  export interface TransactionWriteAPI<
    Model,
    Environment extends RuntimeEnvironment | undefined
  > {
    /**
     * Sets a document to the given data.
     *
     * ```ts
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, set }) =>
     *     set(counter.ref, { count: counter.data.count + 1 })
     * )
     * ```
     *
     * @param id - the id of the document to set
     * @param data - the document data
     */
    set<Model>(id: string, data: WriteModel<Model, Environment>): void

    set<Model>(
      id: string,
      data: ($: WriteHelpers<Model>) => WriteModel<Model, Environment>
    ): void

    /**
     * Sets or updates a document with the given data.
     *
     * ```ts
     * import { transaction, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, upset }) =>
     *     upset(counter.ref, { count: counter.data.count + 1 })
     * )
     * ```
     *
     * @param id - the id of the document to set
     * @param data - the document data
     */
    upset(id: string, data: WriteModel<Model, Environment>): void

    upset(
      id: string,
      data: ($: WriteHelpers<Model>) => WriteModel<Model, Environment>
    ): void

    /**
     * Updates a document.
     *
     * ```ts
     * import { transaction, field, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, update }) =>
     *     update(counter.ref, { count: counter.data.count + 1 })
     *   //=> { __type__: 'doc', data: { count: 43 }, ... }
     * )
     *
     * // ...or using field paths:
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, update }) =>
     *     update(counter.ref, [field('count', counter.data.count + 1)])
     * )
     * ```
     *
     * @returns A promise that resolves when operation is finished
     *
     * @param id - the id of the document to update
     * @param data - the document data to update
     */
    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: UpdateModel<Model>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: ($: WriteHelpers<Model>) => UpdateModel<Model>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    /**
     * Removes a document.
     *
     * ```ts
     * import { transaction, field, collection } from 'typesaurus'
     *
     * type Counter = { count: number }
     * const counters = collection<Counter>('counters')
     *
     * transaction(async ({ get, remove }) => {
     *   const counter = await get('420')
     *   if (counter === 420) await remove(counter.ref)
     * })
     * transaction(
     *   ({ get }) => get('420'),
     *   ({ data: counter, remove }) => {
     *     console.log(counter.data.count)
     *     return remove(counter.ref)
     *   }
     * )
     * ```
     *
     * @returns Promise that resolves when the operation is complete.
     *
     * @param id - The id of the documented to remove
     */
    remove(id: string): Promise<void>
  }

  /**
   * The transaction write API object. It unions a set of functions ({@link TransactionWriteHelpers.set|set},
   * {@link TransactionWriteHelpers.update|update} and {@link TransactionWriteHelpers.remove|remove})
   * that are similar to regular set, update and remove with the only
   * difference that the transaction counterparts will retry writes if
   * the state of data received with {@link TransactionReadHelpers.get|get} would change.
   */
  export interface TransactionWriteHelpers<
    Environment extends RuntimeEnvironment,
    ReadResult
  > {
    /**
     * The result of the read function.
     */
    data: ReadResult

    execute<Model>(
      collection: RichCollection<Model, unknown, unknown>
    ): TransactionWriteAPI<Model, Environment>
  }

  /**
   * The transaction body function type.
   */
  export type TransactionReadFunction<
    Environment extends RuntimeEnvironment,
    ReadResult
  > = ($: TransactionReadHelpers<Environment>) => Promise<ReadResult>

  /**
   * The transaction body function type.
   */
  export type TransactionWriteFunction<
    Environment extends RuntimeEnvironment,
    ReadResult,
    WriteResult
  > = ($: TransactionWriteHelpers<Environment, ReadResult>) => WriteResult

  export interface Transaction {
    <ReadResult, Environment extends RuntimeEnvironment>(
      callback: ($: TransactionReadHelpers<Environment>) => Promise<ReadResult>
    ): Promise<TransactionWriteHelpers<Environment, ReadResult>>
  }

  /**
   *
   */
  export interface RichCollection<
    Model,
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > extends PlainCollection<Model> {
    /** The Firestore path */
    path: string

    all(): PromiseWithListSubscription<Model>

    get(id: string): PromiseWithGetSubscription<Model>

    getMany<OnMissing extends OnMissingMode<unknown> | undefined = undefined>(
      ids: string[],
      options?: {
        onMissing: OnMissing
      }
    ): OnMissing extends 'ignore' | undefined
      ? PromiseWithListSubscription<Model>
      : OnMissing extends OnMissingCallback<infer OnMissingResult>
      ? PromiseWithListSubscription<Model | OnMissingResult>
      : never

    query(
      queries: (
        $: QueryHelpers<
          Model,
          FirestoreWhereFilterOp,
          FirestoreOrderByDirection
        >
      ) => Query<
        Model,
        keyof Model,
        FirestoreWhereFilterOp,
        FirestoreOrderByDirection
      >[]
    ): PromiseWithListSubscription<Model>

    add<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<RichRef<Model>>

    add<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: ($: WriteHelpers<Model>) => WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<RichRef<Model>>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: ($: WriteHelpers<Model>) => WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: UpdateModel<Model> | UpdateFields<Model>,
      options?: { as: Environment }
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: (
        $: WriteHelpers<Model>
      ) => UpdateModel<Model> | UpdateFields<Model>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: WriteModel<Model, Environment>,
      options?: { as: Environment }
    ): Promise<void>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: ($: WriteHelpers<Model>) => WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    remove(id: string): Promise<void>

    ref(id: string): RichRef<Model>

    doc(id: string, data: Model): PlainDoc<Model>
  }

  export interface NestedRichCollection<
    Model,
    Schema extends RichSchema<
      FirestoreWhereFilterOp,
      FirestoreOrderByDirection
    >,
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > extends RichCollection<
      Model,
      FirestoreWhereFilterOp,
      FirestoreOrderByDirection
    > {
    (id: string): Schema
  }

  export type AnyRichCollection<
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > =
    | RichCollection<unknown, FirestoreWhereFilterOp, FirestoreOrderByDirection>
    | NestedRichCollection<
        unknown,
        RichSchema<FirestoreWhereFilterOp, FirestoreOrderByDirection>,
        FirestoreWhereFilterOp,
        FirestoreOrderByDirection
      >

  export interface PlainCollection<_Model> {
    /** The collection type */
    __type__: 'collection'
  }

  export interface Group<_Model> {
    /** The group type */
    __type__: 'group'
  }

  export interface NestedPlainCollection<Model, Schema extends PlainSchema>
    extends PlainCollection<Model> {
    schema: Schema
  }

  export type AnyPlainCollection =
    | PlainCollection<unknown>
    | NestedPlainCollection<unknown, PlainSchema>

  export interface RichSchema<
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > {
    [CollectionPath: string]: AnyRichCollection<
      FirestoreWhereFilterOp,
      FirestoreOrderByDirection
    >
  }

  export interface PlainSchema {
    [CollectionPath: string]: AnyPlainCollection
  }

  /**
   * The type flattens the schema and generates groups from nested and
   * root collections.
   */
  export type Groups<GroupsDB extends DB<unknown, unknown, unknown>> =
    /**
     * {@link ConstructGroups} here plays a role of merger, each level of nesting
     * returns respective collections and the type creates an object from those,
     * inferring the Model (`PostComment | UpdateComment`).
     */
    ConstructGroups<
      /**
       * Extract root-level collections
       */
      ExtractDBModels<GroupsDB>, // Get the models for the given (0) level
      /**
       * 1-level deep
       */
      GroupsDB extends DB<infer Schema, unknown, unknown> // Infer the nested (1) schema
        ? Schema[keyof Schema] extends
            | PlainCollection<infer _>
            | NestedPlainCollection<infer _, infer NestedSchema> // Get the models for the given (1) level
          ? ExtractDBModels<DB<NestedSchema, unknown, unknown>>
          : {}
        : {},
      /**
       * 2-levels deep
       */
      GroupsDB extends DB<infer Schema, unknown, unknown> // Infer the nested (1) schema
        ? Schema[keyof Schema] extends
            | PlainCollection<infer _>
            | NestedPlainCollection<infer _, infer NestedSchema1> // Infer the nested (2) schema
          ? NestedSchema1[keyof NestedSchema1] extends
              | PlainCollection<infer _>
              | NestedPlainCollection<infer _, infer NestedSchema2> // Get the models for the given (2) level
            ? ExtractDBModels<DB<NestedSchema2, unknown, unknown>>
            : {}
          : {}
        : {}
    > // TODO: Do we need more!?

  /**
   * The type merges extracted collections into groups.
   */
  type ConstructGroups<Schema1, Schema2, Schema3> = {
    [CollectionPath in keyof Schema1 | keyof Schema2 | keyof Schema3]: Group<
      // If collection exists in a schema, extract its model, otherwise skip
      | (CollectionPath extends keyof Schema1 ? Schema1[CollectionPath] : never)
      | (CollectionPath extends keyof Schema2 ? Schema2[CollectionPath] : never)
      | (CollectionPath extends keyof Schema3 ? Schema3[CollectionPath] : never)
    >
  }

  /**
   * The type extracts DB models from a collection for {@link Groups}.
   */
  type ExtractDBModels<DB> = {
    /**
     * NOTE: {@link NestedRichCollection} extends {@link RichCollection},
     * so no need to list it here.
     */
    [Path in keyof DB]: DB[Path] extends RichCollection<
      infer Model,
      unknown,
      unknown
    >
      ? Model
      : never
  }

  export type DB<Schema, FirestoreWhereFilterOp, FirestoreOrderByDirection> = {
    [Path in keyof Schema]: Schema[Path] extends NestedPlainCollection<
      infer Model,
      infer Schema
    >
      ? NestedRichCollection<
          Model,
          DB<Schema, FirestoreWhereFilterOp, FirestoreOrderByDirection>,
          FirestoreWhereFilterOp,
          FirestoreOrderByDirection
        >
      : Schema[Path] extends PlainCollection<infer Model>
      ? RichCollection<Model, FirestoreWhereFilterOp, FirestoreOrderByDirection>
      : never
  }

  export type RootDB<
    Schema,
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > = DB<Schema, FirestoreWhereFilterOp, FirestoreOrderByDirection> & {
    groups: Groups<
      DB<Schema, FirestoreWhereFilterOp, FirestoreOrderByDirection>
    >
  }

  export type OnMissingMode<Model> = OnMissingCallback<Model> | 'ignore'

  export type OnMissingCallback<Model> = (id: string) => Model

  export interface OnMissingOptions<Model> {
    onMissing?: OnMissingMode<Model>
  }
}
