import type { TypesaurusUtils } from './utils'

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

  export interface DocOptions<DateStrategy extends ServerDateStrategy> {
    serverTimestamps?: DateStrategy
  }

  export interface DataProperties<
    Environment extends RuntimeEnvironment,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > {
    environment: Environment
    source: Source
    dateStrategy: DateStrategy
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type PlainDoc<Model> = AnyPlainDoc<
    Model,
    RuntimeEnvironment,
    DataSource,
    ServerDateStrategy
  >

  export type AnyPlainDoc<
    Model,
    Environment extends RuntimeEnvironment,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > = Environment extends 'server'
    ? PlainServerDoc<Model>
    : Source extends 'database'
    ? PlainClientDoc<Model, 'database', DateStrategy>
    : DateStrategy extends 'estimate'
    ? PlainClientDoc<Model, 'database', 'estimate'>
    : DateStrategy extends 'previous'
    ? PlainClientDoc<Model, 'database', 'previous'>
    : PlainClientDoc<Model, Source, DateStrategy>

  export interface PlainServerDoc<Model> {
    type: 'doc'
    ref: PlainRef<Model>
    data: ModelNodeData<Model>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface PlainClientDoc<
    Model,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > {
    type: 'doc'
    ref: PlainRef<Model>
    data: Source extends 'database'
      ? AnyModelData<Model, 'present'>
      : DateStrategy extends 'estimate'
      ? AnyModelData<Model, 'present'>
      : AnyModelData<Model, 'nullable'>
    environment: 'web'
    source: Source
    dateStrategy: DateStrategy
    pendingWrites: boolean
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */

  export type RichDoc<Model> = AnyRichDoc<
    Model,
    RuntimeEnvironment,
    DataSource,
    ServerDateStrategy
  >

  export type AnyRichDoc<
    Model,
    Environment extends RuntimeEnvironment,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > = Environment extends 'server'
    ? RichServerDoc<Model>
    : Source extends 'database'
    ? RichClientDoc<Model, 'database', DateStrategy>
    : DateStrategy extends 'estimate'
    ? RichClientDoc<Model, 'database', 'estimate'>
    : DateStrategy extends 'previous'
    ? RichClientDoc<Model, 'database', 'previous'>
    : RichClientDoc<Model, Source, DateStrategy>

  export interface RichServerDoc<Model>
    extends PlainServerDoc<Model>,
      DocAPI<Model> {}

  export interface RichClientDoc<
    Model,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > extends PlainClientDoc<Model, Source, DateStrategy>,
      DocAPI<Model> {}

  export type ModelNodeData<Model> = AnyModelData<Model, 'present'>

  export type ModelData<Model> = AnyModelData<Model, ServerDateNullable>

  export type AnyModelData<Model, DateNullable extends ServerDateNullable> = {
    [Key in keyof Model]: ModelField<Model[Key], DateNullable>
  }

  type ModelField<
    Field,
    DateNullable extends ServerDateNullable
  > = Field extends ServerDate // Process server dates
    ? DateNullable extends 'nullable'
      ? Date | null
      : Date
    : Field extends Date // Stop dates from being processed as an object
    ? Field
    : Field extends object // If it's an object, recursively pass through ModelData
    ? AnyModelData<Field, DateNullable>
    : Field

  export type ResolvedServerDate<
    Environment extends RuntimeEnvironment | undefined,
    FromCache extends boolean,
    DateStrategy extends ServerDateStrategy
  > = Environment extends 'server' // In node environment server dates are always defined
    ? Date
    : ResolvedWebServerDate<FromCache, DateStrategy>

  export type ResolvedWebServerDate<
    FromCache extends boolean,
    DateStrategy extends ServerDateStrategy
  > = FromCache extends false | undefined // Server date is always defined when not from cache
    ? Date
    : DateStrategy extends 'estimate' | 'previous' // Or when the estimate or previous strategy were used
    ? Date
    : Date | null

  /**
   * The document reference type of any type.
   */
  export type Ref<Model> = PlainRef<Model> | RichRef<Model>

  /**
   * The document reference type. Plain version that can be serialized to JSON.
   */
  export interface PlainRef<Model> {
    type: 'ref'
    collection: PlainCollection<Model>
    id: string
  }

  /**
   * The document reference type with Typesaurus document API.
   */
  export interface RichRef<
    Model,
    FirestoreWhereFilterOp,
    FirestoreOrderByDirection
  > extends PlainRef<Model>,
      DocAPI<Model> {
    collection: RichCollection<
      Model,
      FirestoreWhereFilterOp,
      FirestoreOrderByDirection
    >
  }

  export type ServerDateNullable = 'nullable' | 'present'

  export type ServerDateStrategy = 'estimate' | 'previous' | 'none'

  export type RuntimeEnvironment = 'server' | 'client'

  export type DataSource = 'cache' | 'database'

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
   * The update field interface. It contains path to the property and property value.
   */
  export interface UpdateField<Model> {
    key: string | string[]
    value: any
  }

  /**
   * The value types to use for update operation.
   */
  export type UpdateValue<Model, Key> = Key extends keyof Model
    ? Model[Key] extends infer Type
      ? Type extends number
        ? Model[Key] | MaybeValueRemoveOr<Model, Key, ValueIncrement>
        : Type extends Array<infer ItemType>
        ?
            | Model[Key]
            | MaybeValueRemoveOr<Model, Key, ValueArrayUnion<ItemType>>
            | ValueArrayRemove<ItemType>
        : Type extends Date
        ? Model[Key] | MaybeValueRemoveOr<Model, Key, ValueServerDate>
        : Model[Key] | MaybeValueRemove<Model, Key>
      : never
    : never

  /**
   * The value types to use for upset operation.
   */
  export type UpsetValue<Type> = Type extends number
    ? ValueIncrement
    : Type extends Array<infer ItemType>
    ? ValueArrayUnion<ItemType> | ValueArrayRemove<ItemType>
    : Type extends ServerDate
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
  export interface ValueArrayUnion<Type> {
    __type__: 'value'
    kind: 'arrayUnion'
    values: Type[]
  }

  /**
   * The array remove value type. It holds the data to remove from the target array.
   */
  export interface ValueArrayRemove<Type> {
    __type__: 'value'
    kind: 'arrayRemove'
    values: Type[]
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

  export type MaybeValueRemove<
    Model,
    Key extends keyof Model
  > = TypesaurusUtils.RequiredKey<Model, Key> extends true ? never : ValueRemove

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

  export interface WriteHelpers<_Model> {
    serverDate(): ValueServerDate

    remove(): ValueRemove

    increment(value: number): ValueIncrement

    arrayUnion<Type>(values: Type | Type[]): ValueArrayUnion<Type>

    arrayRemove<Type>(values: Type | Type[]): ValueArrayRemove<Type>
  }

  export interface UpdateHelpers<Model> extends WriteHelpers<Model> {
    field<Key1 extends keyof Model>(
      key: Key1,
      value: UpdateValue<Model, Key1>
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: Key2,
      value: TypesaurusUtils.SafePath2<Model, Key1, Key2> extends true
        ? UpdateValue<TypesaurusUtils.AllRequired<Model>[Key1], Key2>
        : never
    ): UpdateField<Model>

    // field<
    //   Key1 extends keyof Model,
    //   Key2 extends keyof Model[Key1],
    //   Key3 extends keyof Model[Key1][Key2]
    // >(
    //   key1: Key1,
    //   key2: Key2,
    //   key3: Key3,
    //   value: TypesaurusUtils.SafePath2<Model, Key1, Key2> extends true
    //     ? UpdateValue<Model[Key1][Key2], Key3>
    //     : never
    // ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      value: TypesaurusUtils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? UpdateValue<
            TypesaurusUtils.AllRequired<
              TypesaurusUtils.AllRequired<Model>[Key1]
            >[Key2],
            Key3
          >
        : never
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<
          TypesaurusUtils.AllRequired<Model>[Key1]
        >[Key2]
      >[Key3]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      value: TypesaurusUtils.SafePath4<
        Model,
        Key1,
        Key2,
        Key3,
        Key4
      > extends true
        ? UpdateValue<
            TypesaurusUtils.AllRequired<
              TypesaurusUtils.AllRequired<
                TypesaurusUtils.AllRequired<Model>[Key1]
              >[Key2]
            >[Key3],
            Key4
          >
        : never
    ): UpdateField<Model>

    /*

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Model[Key1],
      Key3 extends keyof Model[Key1][Key2],
      Key4 extends keyof Model[Key1][Key2][Key3]
    >(
      key: readonly [Key1, Key2, Key3, Key4],
      value:
        | UpdateModel<Model[Key1][Key2][Key3][Key4]>
        | UpdateValue<Model[Key1][Key2][Key3], Key4>
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Model[Key1],
      Key3 extends keyof Model[Key1][Key2],
      Key4 extends keyof Model[Key1][Key2][Key3],
      Key5 extends keyof Model[Key1][Key2][Key3][Key4]
    >(
      key: readonly [Key1, Key2, Key3, Key4, Key5],
      value:
        | UpdateModel<Model[Key1][Key2][Key3][Key4][Key5]>
        | UpdateValue<Model[Key1][Key2][Key3][Key4], Key5>
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Model[Key1],
      Key3 extends keyof Model[Key1][Key2],
      Key4 extends keyof Model[Key1][Key2][Key3],
      Key5 extends keyof Model[Key1][Key2][Key3][Key4],
      Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5]
    >(
      key: readonly [Key1, Key2, Key3, Key4, Key5, Key6],
      value:
        | UpdateModel<Model[Key1][Key2][Key3][Key4][Key5][Key6]>
        | UpdateValue<Model[Key1][Key2][Key3][Key4][Key5], Key6>
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Model[Key1],
      Key3 extends keyof Model[Key1][Key2],
      Key4 extends keyof Model[Key1][Key2][Key3],
      Key5 extends keyof Model[Key1][Key2][Key3][Key4],
      Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
      Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6]
    >(
      key: readonly [Key1, Key2, Key3, Key4, Key5, Key6, Key7],
      value:
        | UpdateModel<Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7]>
        | UpdateValue<Model[Key1][Key2][Key3][Key4][Key5][Key6], Key7>
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Model[Key1],
      Key3 extends keyof Model[Key1][Key2],
      Key4 extends keyof Model[Key1][Key2][Key3],
      Key5 extends keyof Model[Key1][Key2][Key3][Key4],
      Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
      Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
      Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
    >(
      key: readonly [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8],
      value:
        | UpdateModel<Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]>
        | UpdateValue<Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7], Key8>
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Model[Key1],
      Key3 extends keyof Model[Key1][Key2],
      Key4 extends keyof Model[Key1][Key2][Key3],
      Key5 extends keyof Model[Key1][Key2][Key3][Key4],
      Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
      Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
      Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
      Key9 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
    >(
      key: readonly [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9],
      value:
        | UpdateModel<
            Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
          >
        | UpdateValue<
            Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
            Key9
          >
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Model[Key1],
      Key3 extends keyof Model[Key1][Key2],
      Key4 extends keyof Model[Key1][Key2][Key3],
      Key5 extends keyof Model[Key1][Key2][Key3][Key4],
      Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
      Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
      Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
      Key9 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
      Key10 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
    >(
      key: readonly [
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7,
        Key8,
        Key9,
        Key10
      ],
      value:
        | UpdateModel<
            Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][Key10]
          >
        | UpdateValue<
            Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9],
            Key10
          >
    ): UpdateField<Model>*/
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

  export interface SubscriptionPromise<Result> extends Promise<Result> {
    on(callback: SubscriptionPromiseCallback<Result>): OffSubscriptionWithCatch
  }

  export type SubscriptionPromiseCallback<Result> = (result: Result) => void

  export type PromiseWithGetSubscription<
    Model,
    Environment extends RuntimeEnvironment,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > = SubscriptionPromise<AnyRichDoc<
    Model,
    Environment,
    Source,
    DateStrategy
  > | null>

  export type PromiseWithListSubscription<Model> = SubscriptionPromise<
    RichDoc<Model>[]
  >

  export type ListSubscriptionCallback<Model> = {
    (result: PlainDoc<Model>[]): void
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
    Environment extends RuntimeEnvironment
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
    get<DateStrategy extends ServerDateStrategy>(
      id: string,
      options?: DocOptions<DateStrategy>
    ): Promise<AnyPlainDoc<Model, Environment, 'database', DateStrategy> | null>
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
      data: ($: UpdateHelpers<Model>) => UpdateModel<Model>,
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

    get<
      Environment extends RuntimeEnvironment,
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy
    >(
      id: string,
      options?: { as: Environment }
    ): PromiseWithGetSubscription<Model, Environment, Source, DateStrategy>

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
      data: UpdateModel<Model>,
      options?: { as: Environment }
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: (
        $: UpdateHelpers<Model>
      ) => UpdateModel<Model> | UpdateField<Model> | UpdateField<Model>[],
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

    doc(id: string, data: Model): RichDoc<Model>
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
