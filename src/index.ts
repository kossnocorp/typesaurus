import type { TypesaurusQuery } from './types/query'
import type { TypesaurusUtils } from './utils'

export { schema } from './adapter'

export namespace Typesaurus {
  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocChangeType = 'added' | 'removed' | 'modified'

  export interface DocumentMetaData {
    fromCache: boolean
    hasPendingWrites: boolean
  }

  /**
   * Doc change information. It contains the type of change, the doc after
   * the change, and the position change.
   */
  export interface DocChange<
    Model,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    /** The type of change. */
    readonly type: DocChangeType

    /** The document affected by this change. */
    readonly doc: EnvironmentDoc<Model, Source, DateStrategy, Environment>

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
   * An options object that configures the snapshot contents of `all` and
   * `query`.
   */
  export interface SubscriptionListMeta<
    Model,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<Model, Source, DateStrategy, Environment>[]

    /** The number of documents in the QuerySnapshot. */
    readonly size: number

    /** True if there are no documents in the QuerySnapshot. */
    readonly empty: boolean
  }

  export interface DocOptions<DateStrategy extends ServerDateStrategy> {
    serverTimestamps?: DateStrategy
  }

  export interface ReadOptions<
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > extends DocOptions<DateStrategy>,
      OperationOptions<Environment> {}

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export type Doc<Model> = EnvironmentDoc<
    Model,
    DataSource,
    ServerDateStrategy,
    RuntimeEnvironment
  >

  export type EnvironmentDoc<
    Model,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
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
    environment: 'client'
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
  > = Field extends Ref<any>
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
   * Write model getter, accepts helper functions with special value generators
   * and returns {@link WriteModel}.
   */
  export type WriteModelGetter<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = ($: WriteHelpers<Model>) => WriteModel<Model, Environment>

  /**
   * Type of the data passed to write functions. It extends the model allowing
   * to set special values, sucha as server date, increment, etc.
   */
  export type WriteModel<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = {
    [Key in keyof Model]: WriteValue<Model, Key, Environment>
  }

  export type WriteValue<
    Model,
    Key extends keyof Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = Exclude<Model[Key], undefined> extends ServerDate // First, ensure ServerDate is properly set
    ? WriteValueServerDate<Model, Key, Environment>
    : Exclude<Model[Key], undefined> extends Array<infer ItemType>
    ?
        | Model[Key]
        | ValueArrayUnion<ItemType>
        | ValueArrayRemove<ItemType>
        | MaybeValueRemove<Model, Key>
    : Model[Key] extends object // If it's an object, recursively pass through SetModel
    ? WriteModel<Model[Key], Environment>
    : Exclude<Model[Key], undefined> extends number
    ? Model[Key] | ValueIncrement | MaybeValueRemove<Model, Key>
    : Model[Key] | MaybeValueRemove<Model, Key>

  export type WriteValueServerDate<
    Model,
    Key extends keyof Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server' // Date can be used only in the server environment
    ? Date | ValueServerDate | MaybeValueRemove<Model, Key>
    : ValueServerDate | MaybeValueRemove<Model, Key>

  export type UpdateModelArg<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = UpdateModel<Model, Environment> | UpdateModelGetter<Model, Environment>

  export type UpdateModelGetter<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = (
    $: UpdateHelpers<Model>
  ) =>
    | UpdateModel<Model, Environment>
    | UpdateField<Model>
    | UpdateField<Model>[]

  /**
   * Type of the data passed to write functions. It extends the model allowing
   * to set special values, sucha as server date, increment, etc.
   */
  export type UpdateModel<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = {
    [Key in keyof Model]?: WriteValue<Model, Key, Environment>
  }

  /**
   * The update field interface. It contains path to the property and property value.
   */
  export interface UpdateField<_Model> {
    key: string | string[]
    value: any
  }

  export type Value<Type> =
    | ValueRemove
    | ValueIncrement
    | ValueArrayUnion<Type>
    | ValueArrayRemove<Type>
    | ValueServerDate

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
      value: WriteValue<Model, Key1>
    ): UpdateField<Model>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: Key2,
      value: TypesaurusUtils.SafePath2<Model, Key1, Key2> extends true
        ? WriteValue<TypesaurusUtils.AllRequired<Model>[Key1], Key2>
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
        ? WriteValue<
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
        ? WriteValue<
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

  export interface SubscriptionPromise<Result, SubscriptionMeta = undefined>
    extends Promise<Result> {
    on(
      callback: SubscriptionPromiseCallback<Result, SubscriptionMeta>
    ): OffSubscriptionWithCatch
  }

  export type SubscriptionPromiseCallback<
    Result,
    SubscriptionMeta = undefined
  > = SubscriptionMeta extends undefined
    ? (result: Result) => void
    : (result: Result, meta: SubscriptionMeta) => void

  export type ListSubscriptionCallback<Model> = {
    (result: Doc<Model>[]): void
  }

  export interface DocAPI<Model> {
    get<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<EnvironmentDoc<
      Model,
      Source,
      DateStrategy,
      Environment
    > | null>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: UpdateModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    remove(): Promise<Ref<Model>>
  }

  export interface GetManyOptions<
    Model,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined,
    OnMissing extends OnMissingMode<Model> | undefined = undefined
  > extends ReadOptions<DateStrategy, Environment> {
    onMissing?: OnMissing
  }

  export interface CollectionAPI<Model> {
    all<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
      SubscriptionListMeta<Model, Source, DateStrategy, Environment>
    >

    query<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      queries: TypesaurusQuery.QueryGetter<Model>,
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
      SubscriptionListMeta<Model, Source, DateStrategy, Environment>
    >
  }

  /**
   *
   */
  export interface RichCollection<Model>
    extends PlainCollection<Model>,
      CollectionAPI<Model> {
    /** The Firestore path */
    path: string

    get<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      id: string,
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<EnvironmentDoc<
      Model,
      Source,
      DateStrategy,
      Environment
    > | null>

    getMany<
      Source extends DataSource,
      DateStrategy extends Typesaurus.ServerDateStrategy,
      Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined,
      OnMissing extends OnMissingMode<Model> | undefined = undefined
    >(
      ids: string[],
      options?: GetManyOptions<Model, DateStrategy, Environment, OnMissing>
    ): OnMissing extends 'ignore' | undefined
      ? SubscriptionPromise<
          EnvironmentDoc<Model, Source, DateStrategy, Environment>[]
        >
      : OnMissing extends OnMissingCallback<infer OnMissingResult>
      ? SubscriptionPromise<
          Array<
            | EnvironmentDoc<Model, Source, DateStrategy, Environment>
            | OnMissingResult
          >
        >
      : never

    add<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: WriteModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: string,
      data: UpdateModelArg<Model, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Model>>

    remove(id: string): Promise<Ref<Model>>

    ref(id: string): Ref<Model>

    doc<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      id: string,
      data: Model
    ): EnvironmentDoc<Model, Source, DateStrategy, Environment>

    id: () => Promise<string>
  }

  export interface NestedRichCollection<Model, Schema extends AnyDB>
    extends RichCollection<Model> {
    (id: string): Schema
    schema: Schema
  }

  export type AnyRichCollection<Model = unknown> =
    | RichCollection<Model>
    | NestedRichCollection<Model, AnyDB>

  export interface PlainCollection<_Model> {
    /** The collection type */
    type: 'collection'
  }

  export interface NestedPlainCollection<Model, Schema extends PlainSchema>
    extends PlainCollection<Model> {
    schema: Schema
  }

  export type AnyPlainCollection =
    | PlainCollection<unknown>
    | NestedPlainCollection<unknown, PlainSchema>

  export interface PlainSchema {
    [CollectionPath: string]: AnyPlainCollection
  }

  export interface AnyDB {
    [CollectionPath: string]: AnyRichCollection
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

  export type OnMissingMode<Model> = OnMissingCallback<Model> | 'ignore'

  export type OnMissingCallback<Model> = (id: string) => Model

  export interface OnMissingOptions<Model> {
    onMissing?: OnMissingMode<Model>
  }
}
