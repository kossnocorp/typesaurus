import type { TypesaurusUtils } from './utils'

export namespace Typesaurus {
  export type OrderDirection = 'desc' | 'asc'

  export type WhereFilter =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'not-in'
    | 'array-contains-any'

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
    readonly doc: Doc<Model>

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
    Environment extends RuntimeEnvironment | undefined = undefined,
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
  export type Doc<Model> = AnyDoc<
    Model,
    RuntimeEnvironment,
    DataSource,
    ServerDateStrategy
  >

  export type AnyDoc<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > = Environment extends 'server'
    ? ServerDoc<Model>
    : Source extends 'database'
    ? ClientDoc<Model, 'database', DateStrategy>
    : DateStrategy extends 'estimate'
    ? ClientDoc<Model, 'database', 'estimate'>
    : DateStrategy extends 'previous'
    ? ClientDoc<Model, 'database', 'previous'>
    : ClientDoc<Model, Source, DateStrategy>

  export interface ServerDoc<Model> extends DocAPI<Model> {
    type: 'doc'
    ref: Ref<Model>
    data: ModelNodeData<Model>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ClientDoc<
    Model,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > extends DocAPI<Model> {
    type: 'doc'
    ref: Ref<Model>
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

  export type ModelNodeData<Model> = AnyModelData<Model, 'present'>

  export type ModelData<Model> = AnyModelData<Model, ServerDateNullable>

  export type AnyModelData<Model, DateNullable extends ServerDateNullable> = {
    [Key in keyof Model]: ModelField<Model[Key], DateNullable>
  }

  type ModelField<
    Field,
    DateNullable extends ServerDateNullable
  > = Field extends Ref<unknown>
    ? Field
    : Field extends ServerDate // Process server dates
    ? DateNullable extends 'nullable'
      ? Date | null
      : Date
    : Field extends Date // Stop dates from being processed as an object
    ? Field
    : Field extends object // If it's an object, recursively pass through ModelData
    ? AnyModelData<Field, DateNullable>
    : Field

  export type ResolvedServerDate<
    Environment extends RuntimeEnvironment | undefined = undefined | undefined,
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
   * The document reference type.
   */
  export interface Ref<Model> extends DocAPI<Model> {
    type: 'ref'
    collection: RichCollection<Model>
    id: string
  }

  export type ServerDateNullable = 'nullable' | 'present'

  export type ServerDateStrategy = 'estimate' | 'previous' | 'none'

  export type RuntimeEnvironment = 'server' | 'client'

  export type DataSource = 'cache' | 'database'

  export interface ServerDate extends Date {
    __dontUseWillBeUndefined__: true
  }

  export type WriteModelArg<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = WriteModel<Model, Environment> | WriteModelGetter<Model, Environment>

  /**
   * Type of the data passed to write functions. It extends the model allowing
   * to set special values, sucha as server date, increment, etc.
   */
  export type WriteModel<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = {
    [Key in keyof Model]: Exclude<Model[Key], undefined> extends ServerDate // First, ensure ServerDate is properly set
      ? Environment extends 'server' // Date can be used only in the server environment
        ? Date | ValueServerDate
        : ValueServerDate
      : Model[Key] extends Array<infer ItemType>
      ?
          | Model[Key]
          | MaybeValueRemoveOr<Model, Key, ValueArrayUnion<ItemType>>
          | ValueArrayRemove<ItemType>
      : Model[Key] extends object // If it's an object, recursively pass through SetModel
      ? WriteModel<Model[Key], Environment>
      : Model[Key] extends number
      ? Model[Key] | MaybeValueRemoveOr<Model, Key, ValueIncrement>
      : Model[Key]
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
   * Write model getter, accepts helper functions with special value generators
   * and returns {@link WriteModel}.
   */
  export type WriteModelGetter<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = ($: WriteHelpers<Model>) => WriteModel<Model, Environment>

  export type UpdateModelArg<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = WriteModel<Model, Environment> | UpdateModelGetter<Model, Environment>

  export type UpdateModelGetter<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = (
    $: UpdateHelpers<Model>
  ) =>
    | WriteModel<Model, Environment>
    | UpdateField<Model>
    | UpdateField<Model>[]

  /**
   * The update field interface. It contains path to the property and property value.
   */
  export interface UpdateField<_Model> {
    key: string | string[]
    value: any
  }

  // /**
  //  * Type of the data passed to the update function. It extends the model
  //  * making values optional and allow to set value object.
  //  */
  // export type UpdateModel<Model> = {
  //   [Key in keyof Model]?: UpdateModel<Model[Key]> | UpdateValue<Model, Key>
  // }

  // /**
  //  * The value types to use for update operation.
  //  */
  // export type UpdateValue<Model, Key> = Key extends keyof Model
  //   ? Model[Key] extends infer Type
  //     ? Type extends number
  //       ? Model[Key] | MaybeValueRemoveOr<Model, Key, ValueIncrement>
  //       : Type extends Array<infer ItemType>
  //       ?
  //           | Model[Key]
  //           | MaybeValueRemoveOr<Model, Key, ValueArrayUnion<ItemType>>
  //           | ValueArrayRemove<ItemType>
  //       : Type extends Date
  //       ? Model[Key] | MaybeValueRemoveOr<Model, Key, ValueServerDate>
  //       : Model[Key] | MaybeValueRemove<Model, Key>
  //     : never
  //   : never

  // /**
  //  * The value types to use for upset operation.
  //  */
  // export type UpsetValue<Type> = Type extends number
  //   ? ValueIncrement
  //   : Type extends Array<infer ItemType>
  //   ? ValueArrayUnion<ItemType> | ValueArrayRemove<ItemType>
  //   : Type extends ServerDate
  //   ? ValueServerDate
  //   : never

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
    type: 'value'
    kind: 'remove'
  }

  /**
   * The increment value type. It holds the increment value.
   */
  export interface ValueIncrement {
    type: 'value'
    kind: 'increment'
    number: number
  }

  /**
   * The array union value type. It holds the payload to union.
   */
  export interface ValueArrayUnion<Type> {
    type: 'value'
    kind: 'arrayUnion'
    values: Type[]
  }

  /**
   * The array remove value type. It holds the data to remove from the target array.
   */
  export interface ValueArrayRemove<Type> {
    type: 'value'
    kind: 'arrayRemove'
    values: Type[]
  }

  /**
   * The server date value type.
   */
  export interface ValueServerDate {
    type: 'value'
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
  export type Query<Model, Key extends keyof Model> =
    | OrderQuery<Model, Key>
    | WhereQuery<Model>
    | LimitQuery

  /**
   * The order query type. Used to build query.
   */
  export interface OrderQuery<Model, Key extends keyof Model> {
    type: 'order'
    field: Key | DocId
    method: OrderDirection
    cursors: Cursor<Model, Key>[] | undefined
  }

  export interface WhereQuery<_Model> {
    type: 'where'
    field: string | string[] | DocId
    filter: WhereFilter
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
    value: Model[Key] | Doc<Model> | DocId | undefined
  }

  export interface QueryHelpers<Model> {
    where<Key extends keyof Model>(
      key: Key,
      filter: WhereFilter,
      value: Model[Key]
    ): WhereQuery<Model[Key]>

    where<Key1 extends keyof Model, Key2 extends keyof Model[Key1]>(
      field: [Key1, Key2],
      filter: WhereFilter,
      value: Model[Key1][Key2]
    ): WhereQuery<Model[Key1]>

    order<Key extends keyof Model>(key: Key): OrderQuery<Model, Key>

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

    collection<Model>(): PlainCollection<Model>
  }

  export interface OperationOptions<
    Environment extends RuntimeEnvironment | undefined = undefined
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
    (result: Doc<Model> | null /*, info: SnapshotInfo<Model> */): void
  }

  export interface SubscriptionPromise<Result> extends Promise<Result> {
    on(callback: SubscriptionPromiseCallback<Result>): OffSubscriptionWithCatch
  }

  export type SubscriptionPromiseCallback<Result> = (result: Result) => void

  export type PromiseWithGetSubscription<
    Model,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = SubscriptionPromise<AnyDoc<
    Model,
    Environment,
    Source,
    DateStrategy
  > | null>

  export type PromiseWithListSubscription<Model> = SubscriptionPromise<
    Doc<Model>[]
  >

  export type ListSubscriptionCallback<Model> = {
    (result: Doc<Model>[]): void
  }

  export interface DocAPI<Model> {
    get(): Promise<Doc<Model> | null>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: UpdateModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    remove(): Promise<void>
  }

  export interface TransactionReadAPI<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
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
    ): Promise<AnyDoc<Model, Environment, 'database', DateStrategy> | null>
  }

  /**
   * The transaction read API object. It contains {@link TransactionReadHelpers.get|get}
   * the function that allows reading documents from the database.
   */
  export interface TransactionReadHelpers<
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    execute<Model>(
      collection: AnyRichCollection<Model>
    ): TransactionReadAPI<Model, Environment>
  }

  export interface TransactionWriteAPI<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
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
    set<Model>(id: string, data: WriteModelArg<Model, Environment>): void

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
    upset(id: string, data: WriteModelArg<Model, Environment>): void

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
      data: UpdateModelArg<Model, Environment>,
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
    ReadResult,
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    /**
     * The result of the read function.
     */
    data: ReadResult

    execute<Model>(
      collection: RichCollection<Model>
    ): TransactionWriteAPI<Model, Environment>
  }

  /**
   * The transaction body function type.
   */
  export type TransactionReadFunction<
    ReadResult,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = ($: TransactionReadHelpers<Environment>) => Promise<ReadResult>

  /**
   * The transaction body function type.
   */
  export type TransactionWriteFunction<
    ReadResult,
    WriteResult,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = ($: TransactionWriteHelpers<ReadResult, Environment>) => WriteResult

  export interface Transaction {
    <
      ReadResult,
      Environment extends RuntimeEnvironment | undefined = undefined
    >(
      callback: ($: TransactionReadHelpers<Environment>) => Promise<ReadResult>
    ): Promise<TransactionWriteHelpers<ReadResult, Environment>>
  }

  export interface GetManyOptions<
    Model,
    OnMissing extends OnMissingMode<Model> | undefined = undefined
  > {
    onMissing: OnMissing
  }

  /**
   *
   */
  export interface RichCollection<Model> extends PlainCollection<Model> {
    /** The Firestore path */
    path: string

    all(): PromiseWithListSubscription<Model>

    get<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment | undefined = undefined
    >(
      id: string,
      options?: OperationOptions<Environment>
    ): PromiseWithGetSubscription<Model, Source, DateStrategy, Environment>

    getMany<OnMissing extends OnMissingMode<Model> | undefined = undefined>(
      ids: string[],
      options?: GetManyOptions<Model, OnMissing>
    ): OnMissing extends 'ignore' | undefined
      ? PromiseWithListSubscription<Model>
      : OnMissing extends OnMissingCallback<infer OnMissingResult>
      ? PromiseWithListSubscription<Model | OnMissingResult>
      : never

    query(
      queries: ($: QueryHelpers<Model>) => Query<Model, keyof Model>[]
    ): PromiseWithListSubscription<Model>

    add<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: WriteModel<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: UpdateModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<void>

    remove(id: string): Promise<void>

    ref(id: string): Ref<Model>

    doc(id: string, data: Model): Doc<Model>
  }

  export interface NestedRichCollection<Model, Schema extends RichSchema>
    extends RichCollection<Model> {
    (id: string): Schema
  }

  export type AnyRichCollection<Model = unknown> =
    | RichCollection<Model>
    | NestedRichCollection<Model, RichSchema>

  export interface PlainCollection<_Model> {
    /** The collection type */
    type: 'collection'
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

  export interface RichSchema {
    [CollectionPath: string]: AnyRichCollection
  }

  export interface PlainSchema {
    [CollectionPath: string]: AnyPlainCollection
  }

  /**
   * The type flattens the schema and generates groups from nested and
   * root collections.
   */
  export type Groups<GroupsDB extends DB<unknown>> =
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
      GroupsDB extends DB<infer Schema> // Infer the nested (1) schema
        ? Schema[keyof Schema] extends
            | PlainCollection<infer _>
            | NestedPlainCollection<infer _, infer NestedSchema> // Get the models for the given (1) level
          ? ExtractDBModels<DB<NestedSchema>>
          : {}
        : {},
      /**
       * 2-levels deep
       */
      GroupsDB extends DB<infer Schema> // Infer the nested (1) schema
        ? Schema[keyof Schema] extends
            | PlainCollection<infer _>
            | NestedPlainCollection<infer _, infer NestedSchema1> // Infer the nested (2) schema
          ? NestedSchema1[keyof NestedSchema1] extends
              | PlainCollection<infer _>
              | NestedPlainCollection<infer _, infer NestedSchema2> // Get the models for the given (2) level
            ? ExtractDBModels<DB<NestedSchema2>>
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
    [Path in keyof DB]: DB[Path] extends RichCollection<infer Model>
      ? Model
      : never
  }

  export type DB<Schema> = {
    [Path in keyof Schema]: Schema[Path] extends NestedPlainCollection<
      infer Model,
      infer Schema
    >
      ? NestedRichCollection<Model, DB<Schema>>
      : Schema[Path] extends PlainCollection<infer Model>
      ? RichCollection<Model>
      : never
  }

  export type RootDB<Schema> = DB<Schema> & {
    groups: Groups<DB<Schema>>
  }

  export type OnMissingMode<Model> = OnMissingCallback<Model> | 'ignore'

  export type OnMissingCallback<Model> = (id: string) => Model

  export interface OnMissingOptions<Model> {
    onMissing?: OnMissingMode<Model>
  }
}
