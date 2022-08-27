import type { TypesaurusUtils } from '../utils'
import type { TypesaurusQuery } from './query'
import type { TypesaurusUpdate } from './update'

export namespace TypesaurusCore {
  export interface Function {
    <Schema extends PlainSchema>(
      getSchema: ($: SchemaHelpers) => Schema
    ): DB<Schema>
  }

  export interface Id<Path extends string> extends String {
    __dontUseWillBeUndefined__: Path
  }

  export type ModelType = Record<string, any>

  export type ModelIdPair = [ModelType, Id<any>]

  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocChangeType = 'added' | 'removed' | 'modified'

  /**
   * Doc change information. It contains the type of change, the doc after
   * the change, and the position change.
   */
  export interface DocChange<
    ModelPair extends ModelIdPair,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    /** The type of change. */
    readonly type: DocChangeType

    /** The document affected by this change. */
    readonly doc: EnvironmentDoc<ModelPair, Source, DateStrategy, Environment>

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
    ModelPair extends ModelIdPair,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<ModelPair, Source, DateStrategy, Environment>[]

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
  export type Doc<
    ModelPair extends ModelIdPair,
    Source extends DataSource = DataSource,
    DateStrategy extends ServerDateStrategy = ServerDateStrategy,
    Environment extends RuntimeEnvironment = RuntimeEnvironment
  > = EnvironmentDoc<ModelPair, Source, DateStrategy, Environment>

  export type EnvironmentDoc<
    ModelPair extends ModelIdPair,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? ServerDoc<ModelPair>
    : Source extends 'database'
    ? ClientDoc<ModelPair, 'database', DateStrategy>
    : DateStrategy extends 'estimate'
    ? ClientDoc<ModelPair, 'database', 'estimate'>
    : DateStrategy extends 'previous'
    ? ClientDoc<ModelPair, 'database', 'previous'>
    : ClientDoc<ModelPair, Source, DateStrategy>

  export interface ServerDoc<ModelPair extends ModelIdPair>
    extends DocAPI<ModelPair> {
    type: 'doc'
    ref: Ref<ModelPair>
    data: ModelNodeData<ModelPair[0] /* Model */>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ClientDoc<
    ModelPair extends ModelIdPair,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > extends DocAPI<ModelPair> {
    type: 'doc'
    ref: Ref<ModelPair>
    data: Source extends 'database'
      ? AnyModelData<ModelPair[0] /* Model */, 'present'>
      : DateStrategy extends 'estimate'
      ? AnyModelData<ModelPair[0] /* Model */, 'present'>
      : AnyModelData<ModelPair[0] /* Model */, 'nullable'>
    environment: 'client'
    source: Source
    dateStrategy: DateStrategy
    pendingWrites: boolean
  }

  export type ModelNodeData<Model extends ModelType> = AnyModelData<
    Model,
    'present'
  >

  export type ModelData<Model extends ModelType> = AnyModelData<
    Model,
    ServerDateNullable
  >

  export type AnyModelData<
    Model extends ModelType,
    DateNullable extends ServerDateNullable
  > = {
    [Key in keyof Model]: ModelField<Model[Key], DateNullable>
  }

  export type ModelField<
    Field,
    DateNullable extends ServerDateNullable
  > = Field extends Ref<any>
    ? ModelFieldNullable<Field>
    : Field extends ServerDate // Process server dates
    ? DateNullable extends 'nullable'
      ? Date | null
      : ModelFieldNullable<Date>
    : Field extends Date // Stop dates from being processed as an object
    ? ModelFieldNullable<Field>
    : Field extends object // If it's an object, recursively pass through ModelData
    ? AnyModelData<Field, DateNullable>
    : ModelFieldNullable<Field>

  export type ModelFieldNullable<Type> = Type extends undefined
    ? Type | null
    : Type

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
  export interface Ref<ModelPair extends ModelIdPair>
    extends DocAPI<ModelPair> {
    type: 'ref'
    collection: RichCollection<ModelPair>
    id: ModelPair[1] /* Id */
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
    [Key in keyof Model]: WriteValueNullable<
      Model[Key],
      WriteValue<Model, Key, Environment>
    >
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

  export type WriteValueNullable<OriginType, Value> =
    OriginType extends undefined ? Value | null : Value

  export type WriteValueServerDate<
    Model,
    Key extends keyof Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server' // Date can be used only in the server environment
    ? Date | ValueServerDate | MaybeValueRemove<Model, Key>
    : ValueServerDate | MaybeValueRemove<Model, Key>

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

  export interface SchemaHelpers {
    collection<
      Model extends ModelType,
      CustomId extends Id<string> | undefined = undefined
    >(): PlainCollection<Model, CustomId>
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

  export type GetSubscriptionCallback<ModelPair extends ModelIdPair> = {
    (result: Doc<ModelPair> | null /*, info: SnapshotInfo<Model> */): void
  }

  export interface SubscriptionPromise<
    Request,
    Result,
    SubscriptionMeta = undefined
  > extends Promise<Result> {
    request: Request

    on: SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
  }

  export interface SubscriptionPromiseOn<
    Request,
    Result,
    SubscriptionMeta = undefined
  > {
    (
      callback: SubscriptionPromiseCallback<Result, SubscriptionMeta>
    ): OffSubscriptionWithCatch

    request: Request
  }

  export type SubscriptionPromiseCallback<
    Result,
    SubscriptionMeta = undefined
  > = SubscriptionMeta extends undefined
    ? (result: Result) => void
    : (result: Result, meta: SubscriptionMeta) => void

  export type ListSubscriptionCallback<ModelPair extends ModelIdPair> = {
    (result: Doc<ModelPair>[]): void
  }

  export interface Request<Kind> {
    type: 'request'
    kind: Kind
    path: string
    group?: boolean
  }

  export interface GetRequest extends Request<'get'> {
    id: string
  }

  export interface AllRequest extends Request<'all'> {}

  export interface ManyRequest extends Request<'many'> {
    ids: string
  }

  export interface QueryRequest extends Request<'many'> {
    queries: TypesaurusQuery.Query<any>[]
  }

  export interface DocAPI<ModelPair extends ModelIdPair> {
    get<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      GetRequest,
      EnvironmentDoc<ModelPair, Source, DateStrategy, Environment> | null
    >

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<ModelPair[0] /* Model */, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<ModelPair>>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<ModelPair[0] /* Model */, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<ModelPair>>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: TypesaurusUpdate.UpdateModelArg<
        ModelPair[0] /* Model */,
        Environment
      >,
      options?: OperationOptions<Environment>
    ): Promise<Ref<ModelPair>>

    remove(): Promise<Ref<ModelPair>>
  }

  export interface CollectionAPI<ModelPair extends ModelIdPair> {
    all<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      AllRequest,
      EnvironmentDoc<ModelPair, Source, DateStrategy, Environment>[],
      SubscriptionListMeta<ModelPair, Source, DateStrategy, Environment>
    >

    query<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      options?: ReadOptions<DateStrategy, Environment>
    ): TypesaurusQuery.QueryBuilder<
      ModelPair,
      Source,
      DateStrategy,
      Environment
    >

    query<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      queries: TypesaurusQuery.QueryGetter<ModelPair>,
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      QueryRequest,
      EnvironmentDoc<ModelPair, Source, DateStrategy, Environment>[],
      SubscriptionListMeta<ModelPair, Source, DateStrategy, Environment>
    >
  }

  /**
   *
   */
  export interface RichCollection<ModelPair extends ModelIdPair>
    extends CollectionAPI<ModelPair> {
    /** The collection type */
    type: 'collection'

    /** The Firestore path */
    path: string

    get<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      id: ModelPair[1] /* Id */,
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      GetRequest,
      EnvironmentDoc<ModelPair, Source, DateStrategy, Environment> | null
    >

    many<
      Source extends DataSource,
      DateStrategy extends TypesaurusCore.ServerDateStrategy,
      Environment extends TypesaurusCore.RuntimeEnvironment
    >(
      ids: ModelPair[1] /* Id */[],
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      ManyRequest,
      Array<EnvironmentDoc<ModelPair, Source, DateStrategy, Environment> | null>
    >

    add<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: WriteModelArg<ModelPair[0] /* Model */, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<ModelPair>>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: ModelPair[1] /* Id */,
      data: WriteModelArg<ModelPair[0] /* Model */, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<ModelPair>>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: ModelPair[1] /* Id */,
      data: WriteModelArg<ModelPair[0] /* Model */, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<ModelPair>>

    update<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: ModelPair[1] /* Id */,
      data: TypesaurusUpdate.UpdateModelArg<
        ModelPair[0] /* Model */,
        Environment
      >,
      options?: OperationOptions<Environment>
    ): Promise<Ref<ModelPair>>

    remove(id: ModelPair[1] /* Id */): Promise<Ref<ModelPair>>

    ref(id: ModelPair[1] /* Id */): Ref<ModelPair>

    doc<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      id: ModelPair[1] /* Id */,
      data: ModelPair[0] /* Model */
    ): EnvironmentDoc<ModelPair, Source, DateStrategy, Environment>

    id(id: string): ModelPair[1] /* Id */

    id(): Promise<ModelPair[1] /* Id */>
  }

  export interface NestedRichCollection<
    ModelPair extends ModelIdPair,
    Schema extends AnyDB
  > extends RichCollection<ModelPair> {
    (id: ModelPair[1] /* Id */): Schema
    schema: Schema
  }

  export type Collection<ModelPair extends ModelIdPair> =
    | RichCollection<ModelPair>
    | NestedRichCollection<ModelPair, AnyDB>

  export interface PlainCollection<
    Model extends ModelType,
    CustomId extends Id<string> | undefined = undefined
  > {
    /** The collection type */
    type: 'collection'

    sub<Schema extends PlainSchema>(
      schema: Schema
    ): NestedPlainCollection<Model, Schema, CustomId>
  }

  export interface NestedPlainCollection<
    _Model extends ModelType,
    Schema extends PlainSchema,
    _CustomId extends Id<string> | undefined = undefined
  > {
    /** The collection type */
    type: 'collection'

    schema: Schema
  }

  export type AnyPlainCollection =
    | PlainCollection<any>
    | NestedPlainCollection<any, PlainSchema>

  export interface PlainSchema {
    [Path: string]:
      | PlainCollection<any>
      | NestedPlainCollection<any, PlainSchema>
  }

  export interface AnyDB {
    [CollectionPath: string]: Collection<any>
  }

  export type DB<Schema, BasePath extends string | undefined = undefined> = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId
        >
        ? NestedRichCollection<
            [
              Model,
              CustomId extends Id<any>
                ? CustomId
                : Id<TypesaurusUtils.ComposePath<BasePath, Path>>
            ],
            DB<Schema, TypesaurusUtils.ComposePath<BasePath, Path>>
          >
        : Schema[Path] extends PlainCollection<infer Model, infer CustomId>
        ? RichCollection<
            [
              Model,
              CustomId extends Id<any>
                ? CustomId
                : Id<TypesaurusUtils.ComposePath<BasePath, Path>>
            ]
          >
        : never
      : never
  }

  /**
   * Infers schema types. Useful to define function arguments that accept
   * collection doc, ref, id or data.
   */
  export type InferSchema<DB extends TypesaurusCore.DB<any, any>> = {
    /**
     * Collection types, use `["Id"]`, `["Ref"]` and `["Doc"]` to access common
     * document types.
     *
     * If the collection contains subcollections use its path to access
     * the subcollection types, i.e. `["comments"]["Id"]`.
     */
    [Path in keyof DB]: DB[Path] extends
      | RichCollection<infer ModelPair>
      | NestedRichCollection<infer ModelPair, any>
      ? {
          /**
           * The documents' id.
           *
           * Essentially it's a string, but TypeScript will force you to use
           * `.toString()` to cast it to `string`.
           */
          Id: ModelPair[1] /* Id */

          /**
           * The documents' reference, contains its id and collection.
           */
          Ref: TypesaurusCore.Ref<ModelPair>

          /**
           * The main document object, contains reference with id and collection
           * and document data.
           */
          Doc: TypesaurusCore.EnvironmentDoc<ModelPair, any, any, any>

          /**
           * The document data
           */
          Data: ModelData<ModelPair[0] /* Model */>

          /**
           * Read result, either doc, `null` (not found) or `undefined`
           * (the read is not finished/started yet).
           */
          Result:
            | TypesaurusCore.EnvironmentDoc<ModelPair, any, any, any>
            | null
            | undefined
        } & (DB[Path] extends NestedRichCollection<any, infer Schema>
          ? InferSchema<Schema>
          : {})
      : never
  }

  /**
   * Narrows doc type. If your doc has multiple shapes, the type will help you
   * narrow down data type to a specific type.
   */
  export type NarrowDoc<
    OriginalDoc extends Doc<[any, any]>,
    NarrowToModel extends ModelData<any>
  > = OriginalDoc extends Doc<infer ModelPair>
    ? ModelPair extends [infer OriginalModel, infer OriginalId]
      ? OriginalModel extends NarrowToModel
        ? NarrowToModel extends ModelData<any>
          ? OriginalId extends Id<any>
            ? Doc<[NarrowToModel, OriginalId]>
            : never
          : never
        : never
      : never
    : never
}
