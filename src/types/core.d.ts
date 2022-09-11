import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusQuery as Query } from './query'
import type { TypesaurusUpdate as Update } from './update'

export namespace TypesaurusCore {
  export interface Function {
    <Schema extends PlainSchema>(
      getSchema: ($: SchemaHelpers) => Schema
    ): DB<Schema>
  }

  export type Id<Path extends string> = string & {
    __dontUseWillBeUndefined__: Path
  }

  export type ModelType =
    | ModelObjectType
    | [ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType]
  // | [ModelObjectType, ModelObjectType, ModelObjectType, ModelObjectType]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]

  export type ModelObjectType = object & { length?: never }

  export type ResolveModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType
  ]
    ? A | B | C
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType
      ]
    ? A | B
    : Model extends ModelObjectType
    ? Model
    : never

  export type SharedModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType
  ]
    ? Utils.SharedShape3<A, B, C>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType
      ]
    ? Utils.SharedShape2<A, B>
    : Model extends ModelObjectType
    ? Model
    : never

  export interface DocDefFlags {
    Reduced: boolean
  }

  export type DocDef = {
    Model: ModelType
    Id: Id<string>
    /**
     * If the collection has variable shape, it will contain models tuple,
     * otherwise it will be equal {@link Model}.
     */
    WideModel: ModelType
    Flags: DocDefFlags
  }

  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocChangeType = 'added' | 'removed' | 'modified'

  /**
   * Doc change information. It contains the type of change, the doc after
   * the change, and the position change.
   */
  export interface DocChange<
    Def extends DocDef,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    /** The type of change. */
    readonly type: DocChangeType

    /** The document affected by this change. */
    readonly doc: EnvironmentDoc<Def, Source, DateStrategy, Environment>

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
    Def extends DocDef,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<Def, Source, DateStrategy, Environment>[]

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
    Def extends DocDef,
    Source extends DataSource = DataSource,
    DateStrategy extends ServerDateStrategy = ServerDateStrategy,
    Environment extends RuntimeEnvironment = RuntimeEnvironment
  > = EnvironmentDoc<Def, Source, DateStrategy, Environment>

  export type ReduceDef<
    Def extends DocDef,
    ReduceToModel,
    Flags = Def['Flags']
  > = {
    Model: ReduceToModel
    Id: Def['Id']
    WideModel: Def['WideModel']
    Flags: Flags
  }

  export type VariableEnvironmentDoc<
    Def extends DocDef,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = Def['Model'] extends [
    infer A extends ModelType,
    infer B extends ModelType,
    infer C extends ModelType
  ]
    ?
        | EnvironmentDoc<ReduceDef<Def, A>, Source, DateStrategy, Environment>
        | EnvironmentDoc<ReduceDef<Def, B>, Source, DateStrategy, Environment>
        | EnvironmentDoc<ReduceDef<Def, C>, Source, DateStrategy, Environment>
    : Def['Model'] extends [
        infer A extends ModelType,
        infer B extends ModelType
      ]
    ?
        | EnvironmentDoc<ReduceDef<Def, A>, Source, DateStrategy, Environment>
        | EnvironmentDoc<ReduceDef<Def, B>, Source, DateStrategy, Environment>
    : EnvironmentDoc<Def, Source, DateStrategy, Environment>

  export type EnvironmentDoc<
    Def extends DocDef,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server'
    ? ServerDoc<Def>
    : Source extends 'database'
    ? ClientDoc<Def, 'database', DateStrategy>
    : DateStrategy extends 'estimate'
    ? ClientDoc<Def, 'database', 'estimate'>
    : DateStrategy extends 'previous'
    ? ClientDoc<Def, 'database', 'previous'>
    : ClientDoc<Def, Source, DateStrategy>

  export interface ServerDoc<Def extends DocDef> extends DocAPI<Def> {
    type: 'doc'
    ref: Ref<Def>
    data: ModelNodeData<Def['Model']>
    environment: 'server'
    source?: undefined
    dateStrategy?: undefined
    pendingWrites?: undefined
  }

  export interface ClientDoc<
    Def extends DocDef,
    Source extends DataSource,
    DateStrategy extends ServerDateStrategy
  > extends DocAPI<Def> {
    type: 'doc'
    ref: Ref<Def>
    data: Source extends 'database'
      ? AnyModelData<Def['Model'], 'present'>
      : DateStrategy extends 'estimate'
      ? AnyModelData<Def['Model'], 'present'>
      : AnyModelData<Def['Model'], 'nullable'>
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
    : Field extends Date | Id<string> // Stop dates & ids from being processed as an object
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
  export interface Ref<Def extends DocDef> extends DocAPI<Def> {
    type: 'ref'
    collection: RichCollection<Def>
    id: Def['Id']
  }

  export type ServerDateNullable = 'nullable' | 'present'

  export type ServerDateStrategy = 'estimate' | 'previous' | 'none'

  export type RuntimeEnvironment = 'server' | 'client'

  export type DataSource = 'cache' | 'database'

  export interface ServerDate extends Date {
    __dontUseWillBeUndefined__: true
  }

  export type SetModelArg<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = SetModel<Model, Environment> | SetModelGetter<Model, Environment>

  /**
   * Write model getter, accepts helper functions with special value generators
   * and returns {@link SetModel}.
   */
  export type SetModelGetter<
    Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = ($: WriteHelpers<Model>) => SetModel<Model, Environment>

  /**
   * Type of the data passed to write functions. It extends the model allowing
   * to set special values, sucha as server date, increment, etc.
   */
  export type SetModel<
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
  > = Exclude<Model[Key], undefined> extends infer Type // Exclude undefined
    ? Type extends ServerDate // First, ensure ServerDate is properly set
      ? WriteValueServerDate<Model, Key, Environment>
      : Type extends Array<infer ItemType>
      ? WriteValueArray<Model, Key, ItemType>
      : Type extends object // If it's an object, recursively pass through SetModel
      ? WriteValueObject<Model, Key, Environment>
      : Type extends number
      ? WriteValueNumber<Model, Key>
      : WriteValueOther<Model, Key>
    : never

  export type WriteValueNullable<OriginType, Value> =
    OriginType extends undefined ? Value | null : Value

  export type WriteValueServerDate<
    Model,
    Key extends keyof Model,
    Environment extends RuntimeEnvironment | undefined = undefined
  > = Environment extends 'server' // Date can be used only in the server environment
    ? Date | ValueServerDate | MaybeValueRemove<Model, Key>
    : ValueServerDate | MaybeValueRemove<Model, Key>

  export type WriteValueArray<Model, Key extends keyof Model, ItemType> =
    | Model[Key]
    | ValueArrayUnion<ItemType>
    | ValueArrayRemove<ItemType>
    | MaybeValueRemove<Model, Key>

  export type WriteValueNumber<Model, Key extends keyof Model> =
    | Model[Key]
    | ValueIncrement
    | MaybeValueRemove<Model, Key>

  export type WriteValueOther<Model, Key extends keyof Model> =
    | Model[Key]
    | MaybeValueRemove<Model, Key>

  export type WriteValueObject<
    Model,
    Key extends keyof Model,
    Environment extends RuntimeEnvironment | undefined
  > =
    | SetModel<Model[Key], Environment> // Even for update, nested objects are passed to set model
    | MaybeValueRemove<Model, Key>

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
  > = Utils.RequiredKey<Model, Key> extends true ? never : ValueRemove

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

  export type GetSubscriptionCallback<Def extends DocDef> = {
    (result: Doc<Def> | null /*, info: SnapshotInfo<Model> */): void
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

  export type ListSubscriptionCallback<Def extends DocDef> = {
    (result: Doc<Def>[]): void
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
    queries: Query.Query<any>[]
  }

  export interface DocAPI<Def extends DocDef> {
    get<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      GetRequest,
      VariableEnvironmentDoc<Def, Source, DateStrategy, Environment> | null
    >

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    update: Update.DocFunction<Def>

    remove(): Promise<Ref<Def>>

    reduce<ExpectedModel extends ModelType>(
      fn: DocNarrowFunction<ResolveModelType<Def['WideModel']>, ExpectedModel>
    ): this is EnvironmentDoc<
      {
        Model: ExpectedModel
        Id: Def['Id']
        WideModel: Def['WideModel']
        Flags: Def['Flags'] & { Reduced: true }
      },
      DataSource,
      ServerDateStrategy,
      RuntimeEnvironment
    >
  }

  export type DocNarrowFunction<
    InputModel extends ModelType,
    ExpectedModel extends ModelType
  > = (data: InputModel) => false | ExpectedModel

  export interface CollectionAPI<Def extends DocDef> {
    all<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      AllRequest,
      EnvironmentDoc<Def, Source, DateStrategy, Environment>[],
      SubscriptionListMeta<Def, Source, DateStrategy, Environment>
    >

    query: Query.Function<Def>
  }

  /**
   *
   */
  export interface RichCollection<Def extends DocDef>
    extends CollectionAPI<Def> {
    /** The collection type */
    type: 'collection'

    /** The Firestore path */
    path: string

    get<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      id: Def['Id'],
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      GetRequest,
      VariableEnvironmentDoc<Def, Source, DateStrategy, Environment> | null
    >

    many<
      Source extends DataSource,
      DateStrategy extends TypesaurusCore.ServerDateStrategy,
      Environment extends TypesaurusCore.RuntimeEnvironment
    >(
      ids: Def['Id'][],
      options?: ReadOptions<DateStrategy, Environment>
    ): SubscriptionPromise<
      ManyRequest,
      Array<EnvironmentDoc<Def, Source, DateStrategy, Environment> | null>
    >

    add<Environment extends RuntimeEnvironment | undefined = undefined>(
      data: SetModelArg<ResolveModelType<Def['Model']>, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    set<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: Def['Id'],
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    upset<Environment extends RuntimeEnvironment | undefined = undefined>(
      id: Def['Id'],
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Environment>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    update: Update.CollectionFunction<Def>

    remove(id: Def['Id']): Promise<Ref<Def>>

    ref(id: Def['Id']): Ref<Def>

    doc<
      Source extends DataSource,
      DateStrategy extends ServerDateStrategy,
      Environment extends RuntimeEnvironment
    >(
      id: Def['Id'],
      data: Def['Model']
    ): EnvironmentDoc<Def, Source, DateStrategy, Environment>

    id(id: string): Def['Id']

    id(): Promise<Def['Id']>
  }

  export interface NestedRichCollection<
    Def extends DocDef,
    Schema extends AnyDB
  > extends RichCollection<Def> {
    (id: Def['Id']): Schema
    schema: Schema
  }

  export type Collection<Def extends DocDef> =
    | RichCollection<Def>
    | NestedRichCollection<Def, AnyDB>

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
            {
              Model: Model
              Id: CustomId extends Id<any>
                ? CustomId
                : Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: DocDefFlags
            },
            DB<Schema, Utils.ComposePath<BasePath, Path>>
          >
        : Schema[Path] extends PlainCollection<infer Model, infer CustomId>
        ? RichCollection<{
            Model: Model
            Id: CustomId extends Id<any>
              ? CustomId
              : Id<Utils.ComposePath<BasePath, Path>>
            WideModel: Model
            Flags: DocDefFlags
          }>
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
      | RichCollection<infer Def>
      | NestedRichCollection<infer Def, any>
      ? {
          /**
           * The documents' id.
           *
           * Essentially it's a string, but TypeScript will force you to use
           * `.toString()` to cast it to `string`.
           */
          Id: Def['Id']

          /**
           * The documents' reference, contains its id and collection.
           */
          Ref: TypesaurusCore.Ref<Def>

          /**
           * The main document object, contains reference with id and collection
           * and document data.
           */
          Doc: TypesaurusCore.VariableEnvironmentDoc<
            Def,
            DataSource,
            ServerDateStrategy,
            RuntimeEnvironment
          >

          /**
           * The document data
           */
          Data: ModelData<Def['Model']>

          /**
           * Read result, either doc, `null` (not found) or `undefined`
           * (the read is not finished/started yet).
           */
          Result:
            | TypesaurusCore.EnvironmentDoc<Def, any, any>
            | null
            | undefined
        } & (DB[Path] extends NestedRichCollection<
          any,
          infer Schema extends TypesaurusCore.DB<any, any>
        >
          ? InferSchema<Schema>
          : {})
      : never
  }

  /**
   * Reduce doc type. If your doc has multiple shapes, the type will help you
   * reduce down data type to a specific type.
   */
  export type ReduceDoc<
    OriginalDoc extends Doc<any>,
    ReduceToModel extends ModelData<any>
  > = OriginalDoc extends Doc<infer Def extends DocDef>
    ? ReduceToModel extends ResolveModelType<Def['Model']>
      ? Doc<ReduceDef<Def, ReduceToModel, Def['Flags'] & { Reduced: true }>>
      : never
    : never

  interface TextContent {
    type: 'text'
    text: string
    public?: boolean
  }

  interface ImageContent {
    type: 'image'
    src: string
    public?: boolean
  }

  class Asa {
    reduce:
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
      | (<ExpectedModel extends ModelType>(
          fn: DocNarrowFunction<TextContent | ImageContent, ExpectedModel>
        ) => this is
          | ServerDoc<{
              Model: ExpectedModel
              Id: Id<'content'>
              WideModel: [TextContent, ImageContent]
              Flags: DocDefFlags & { Reduced: true }
            }>
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'estimate'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              'previous'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'cache',
              'none'
            >
          | ClientDoc<
              {
                Model: ExpectedModel
                Id: Id<'content'>
                WideModel: [TextContent, ImageContent]
                Flags: DocDefFlags & { Reduced: true }
              },
              'database',
              ServerDateStrategy
            >)
  }

  // type C = A extends Doc<infer Ref> ? Ref : never
}
