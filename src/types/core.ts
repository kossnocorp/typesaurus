import type { TypesaurusUtils as Utils } from "./utils.js";
import type { TypesaurusQuery as Query } from "./query.js";
import type { TypesaurusUpdate as Update } from "./update.js";
import type { TypesaurusFirebase as Firebase } from "./firebase.js";

export namespace TypesaurusCore {
  export interface Function {
    <Schema extends PlainSchema, Opts extends Options>(
      getSchema: ($: SchemaHelpers) => Schema,
      options?: Opts,
    ): DB<Schema>;
  }

  /**
   * Define custom id passing the collection path string as the generic.
   */
  export type Id<Path extends string | symbol | Array<string | symbol>> =
    string & {
      [idBrand]: Path;
    };
  declare const idBrand: unique symbol;
  /**
   * The custom id constrain. Used to define collection id type.
   */
  export type CustomIdConstrain = Id<string> | string | false;

  export type ModelType = ModelObjectType | ModelVariableType;

  export type ModelVariableType =
    | [ModelObjectType]
    | [ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType, ModelObjectType]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ];

  export type ModelObjectType = object & { length?: never };

  export type DocModel<Def extends DocDef> =
    Def["Flags"]["Reduced"] extends true
      ? IntersectVariableModelType<Def["Model"]>
      : SharedVariableModelType<Def["WideModel"]>;

  export type IntersectVariableModelType<Model extends ModelType> =
    Model extends [
      infer A extends ModelObjectType,
      infer B extends ModelObjectType,
      infer C extends ModelObjectType,
      infer D extends ModelObjectType,
      infer E extends ModelObjectType,
      infer F extends ModelObjectType,
      infer G extends ModelObjectType,
      infer H extends ModelObjectType,
      infer I extends ModelObjectType,
      infer J extends ModelObjectType,
    ]
      ? Utils.IntersectShape<A, B, C, D, E, F, G, H, I, J>
      : Model extends [
            infer A extends ModelObjectType,
            infer B extends ModelObjectType,
            infer C extends ModelObjectType,
            infer D extends ModelObjectType,
            infer E extends ModelObjectType,
            infer F extends ModelObjectType,
            infer G extends ModelObjectType,
            infer H extends ModelObjectType,
            infer I extends ModelObjectType,
          ]
        ? Utils.IntersectShape<A, B, C, D, E, F, G, H, I>
        : Model extends [
              infer A extends ModelObjectType,
              infer B extends ModelObjectType,
              infer C extends ModelObjectType,
              infer D extends ModelObjectType,
              infer E extends ModelObjectType,
              infer F extends ModelObjectType,
              infer G extends ModelObjectType,
              infer H extends ModelObjectType,
            ]
          ? Utils.IntersectShape<A, B, C, D, E, F, G, H>
          : Model extends [
                infer A extends ModelObjectType,
                infer B extends ModelObjectType,
                infer C extends ModelObjectType,
                infer D extends ModelObjectType,
                infer E extends ModelObjectType,
                infer F extends ModelObjectType,
                infer G extends ModelObjectType,
              ]
            ? Utils.IntersectShape<A, B, C, D, E, F, G>
            : Model extends [
                  infer A extends ModelObjectType,
                  infer B extends ModelObjectType,
                  infer C extends ModelObjectType,
                  infer D extends ModelObjectType,
                  infer E extends ModelObjectType,
                  infer F extends ModelObjectType,
                ]
              ? Utils.IntersectShape<A, B, C, D, E, F>
              : Model extends [
                    infer A extends ModelObjectType,
                    infer B extends ModelObjectType,
                    infer C extends ModelObjectType,
                    infer D extends ModelObjectType,
                    infer E extends ModelObjectType,
                  ]
                ? Utils.IntersectShape<A, B, C, D, E>
                : Model extends [
                      infer A extends ModelObjectType,
                      infer B extends ModelObjectType,
                      infer C extends ModelObjectType,
                      infer D extends ModelObjectType,
                    ]
                  ? Utils.IntersectShape<A, B, C, D>
                  : Model extends [
                        infer A extends ModelObjectType,
                        infer B extends ModelObjectType,
                        infer C extends ModelObjectType,
                      ]
                    ? Utils.IntersectShape<A, B, C>
                    : Model extends [
                          infer A extends ModelObjectType,
                          infer B extends ModelObjectType,
                        ]
                      ? Utils.IntersectShape<A, B>
                      : Model extends [infer A extends ModelObjectType]
                        ? A
                        : Model extends ModelObjectType
                          ? Model
                          : never;

  export type SharedVariableModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType,
    infer D extends ModelObjectType,
    infer E extends ModelObjectType,
    infer F extends ModelObjectType,
    infer G extends ModelObjectType,
    infer H extends ModelObjectType,
    infer I extends ModelObjectType,
    infer J extends ModelObjectType,
  ]
    ? Utils.SharedShape10<A, B, C, D, E, F, G, H, I, J>
    : Model extends [
          infer A extends ModelObjectType,
          infer B extends ModelObjectType,
          infer C extends ModelObjectType,
          infer D extends ModelObjectType,
          infer E extends ModelObjectType,
          infer F extends ModelObjectType,
          infer G extends ModelObjectType,
          infer H extends ModelObjectType,
          infer I extends ModelObjectType,
        ]
      ? Utils.SharedShape9<A, B, C, D, E, F, G, H, I>
      : Model extends [
            infer A extends ModelObjectType,
            infer B extends ModelObjectType,
            infer C extends ModelObjectType,
            infer D extends ModelObjectType,
            infer E extends ModelObjectType,
            infer F extends ModelObjectType,
            infer G extends ModelObjectType,
            infer H extends ModelObjectType,
          ]
        ? Utils.SharedShape8<A, B, C, D, E, F, G, H>
        : Model extends [
              infer A extends ModelObjectType,
              infer B extends ModelObjectType,
              infer C extends ModelObjectType,
              infer D extends ModelObjectType,
              infer E extends ModelObjectType,
              infer F extends ModelObjectType,
              infer G extends ModelObjectType,
            ]
          ? Utils.SharedShape7<A, B, C, D, E, F, G>
          : Model extends [
                infer A extends ModelObjectType,
                infer B extends ModelObjectType,
                infer C extends ModelObjectType,
                infer D extends ModelObjectType,
                infer E extends ModelObjectType,
                infer F extends ModelObjectType,
              ]
            ? Utils.SharedShape6<A, B, C, D, E, F>
            : Model extends [
                  infer A extends ModelObjectType,
                  infer B extends ModelObjectType,
                  infer C extends ModelObjectType,
                  infer D extends ModelObjectType,
                  infer E extends ModelObjectType,
                ]
              ? Utils.SharedShape5<A, B, C, D, E>
              : Model extends [
                    infer A extends ModelObjectType,
                    infer B extends ModelObjectType,
                    infer C extends ModelObjectType,
                    infer D extends ModelObjectType,
                  ]
                ? Utils.SharedShape4<A, B, C, D>
                : Model extends [
                      infer A extends ModelObjectType,
                      infer B extends ModelObjectType,
                      infer C extends ModelObjectType,
                    ]
                  ? Utils.SharedShape3<A, B, C>
                  : Model extends [
                        infer A extends ModelObjectType,
                        infer B extends ModelObjectType,
                      ]
                    ? Utils.SharedShape2<A, B>
                    : Model extends [infer A extends ModelObjectType]
                      ? A
                      : Model extends ModelObjectType
                        ? Model
                        : never;

  export type UnionVariableModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType,
    infer D extends ModelObjectType,
    infer E extends ModelObjectType,
    infer F extends ModelObjectType,
    infer G extends ModelObjectType,
    infer H extends ModelObjectType,
    infer I extends ModelObjectType,
    infer J extends ModelObjectType,
  ]
    ? A | B | C | D | E | F | G | H | I | J
    : Model extends [
          infer A extends ModelObjectType,
          infer B extends ModelObjectType,
          infer C extends ModelObjectType,
          infer D extends ModelObjectType,
          infer E extends ModelObjectType,
          infer F extends ModelObjectType,
          infer G extends ModelObjectType,
          infer H extends ModelObjectType,
          infer I extends ModelObjectType,
        ]
      ? A | B | C | D | E | F | G | H | I
      : Model extends [
            infer A extends ModelObjectType,
            infer B extends ModelObjectType,
            infer C extends ModelObjectType,
            infer D extends ModelObjectType,
            infer E extends ModelObjectType,
            infer F extends ModelObjectType,
            infer G extends ModelObjectType,
            infer H extends ModelObjectType,
          ]
        ? A | B | C | D | E | F | G | H
        : Model extends [
              infer A extends ModelObjectType,
              infer B extends ModelObjectType,
              infer C extends ModelObjectType,
              infer D extends ModelObjectType,
              infer E extends ModelObjectType,
              infer F extends ModelObjectType,
              infer G extends ModelObjectType,
            ]
          ? A | B | C | D | E | F | G
          : Model extends [
                infer A extends ModelObjectType,
                infer B extends ModelObjectType,
                infer C extends ModelObjectType,
                infer D extends ModelObjectType,
                infer E extends ModelObjectType,
                infer F extends ModelObjectType,
              ]
            ? Utils.SharedShape6<A, B, C, D, E, F>
            : Model extends [
                  infer A extends ModelObjectType,
                  infer B extends ModelObjectType,
                  infer C extends ModelObjectType,
                  infer D extends ModelObjectType,
                  infer E extends ModelObjectType,
                ]
              ? A | B | C | D | E
              : Model extends [
                    infer A extends ModelObjectType,
                    infer B extends ModelObjectType,
                    infer C extends ModelObjectType,
                    infer D extends ModelObjectType,
                  ]
                ? A | B | C | D
                : Model extends [
                      infer A extends ModelObjectType,
                      infer B extends ModelObjectType,
                      infer C extends ModelObjectType,
                    ]
                  ? A | B | C
                  : Model extends [
                        infer A extends ModelObjectType,
                        infer B extends ModelObjectType,
                      ]
                    ? A | B
                    : Model extends [infer A extends ModelObjectType]
                      ? A
                      : Model extends ModelObjectType
                        ? Model
                        : never;

  /**
   * Concats models into single variable model type. Useful to define and export
   * variable models ouside of the centraliazed schema definition.
   */
  export type ConcatModel<
    ModelToConcatTo extends ModelType,
    ModelToConcat extends ModelType,
  > = ModelToConcatTo extends ModelObjectType
    ? ModelToConcat extends ModelObjectType
      ? [ModelToConcatTo, ModelToConcat]
      : ModelToConcat extends ModelVariableType
        ? [ModelToConcatTo, ...ModelToConcat]
        : never
    : ModelToConcatTo extends ModelVariableType
      ? ModelToConcat extends ModelObjectType
        ? [...ModelToConcatTo, ModelToConcat]
        : ModelToConcat extends ModelVariableType
          ? [...ModelToConcatTo, ...ModelToConcat]
          : never
      : never;

  export interface DocDefFlags {
    Reduced: boolean;
  }

  export interface DocDef {
    Model: ModelType;
    /**
     * The collection name (path segment).
     */
    Name: string;
    Id: Id<string> | string;
    /**
     * If the collection has variable shape, it will contain models tuple,
     * otherwise it will be equal {@link Model}.
     */
    WideModel: ModelType;
    Flags: DocDefFlags;
  }

  export interface DocProps {
    readonly environment: RuntimeEnvironment;
    readonly source: DataSource;
    readonly dateStrategy: ServerDateStrategy;
    readonly pendingWrites: boolean;
  }

  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocChangeType = "added" | "removed" | "modified";

  /**
   * Doc change information. It contains the type of change, the doc after
   * the change, and the position change.
   */
  export interface DocChange<Def extends DocDef, Props extends DocProps> {
    /** The type of change. */
    readonly type: DocChangeType;

    /** The document affected by this change. */
    readonly doc: Doc<Def, Props>;

    /**
     * The index of the changed document in the result set immediately prior to
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange` objects
     * have been applied). Is -1 for 'added' events.
     */
    readonly oldIndex: number;

    /**
     * The index of the changed document in the result set immediately after
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange`
     * objects and the current `DocumentChange` object have been applied).
     * Is -1 for 'removed' events.
     */
    readonly newIndex: number;
  }

  /**
   * An options object that configures the snapshot contents of `all` and
   * `query`.
   */
  export interface SubscriptionListMeta<
    Def extends DocDef,
    Props extends DocProps,
  > {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<Def, Props>[];

    /** The number of documents in the QuerySnapshot. */
    readonly size: number;

    /** True if there are no documents in the QuerySnapshot. */
    readonly empty: boolean;
  }

  export interface DocOptions<Props extends DocProps> {
    serverTimestamps?: Props["dateStrategy"];
  }

  export interface ReadOptions<
    Environment extends RuntimeEnvironment,
    Props extends DocProps & { environment: Environment },
  > extends DocOptions<Props>,
      OperationOptions<Environment> {}

  export type NarrowDef<
    Def extends DocDef,
    ReduceToModel,
    Flags = Def["Flags"],
  > = {
    Model: ReduceToModel;
    Id: Def["Id"];
    WideModel: Def["WideModel"];
    Flags: Flags;
  };

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface Doc<Def extends DocDef, Props extends DocProps>
    extends DocAPI<Def> {
    type: "doc";

    ref: Ref<Def>;

    data: DocData<Def, Props>;

    readonly props: Props;

    test<Props extends Partial<DocProps>>(
      props: Props,
    ): this is Doc<Def, DocProps & Props>;

    assert<Props extends Partial<DocProps>>(
      props: Props,
    ): asserts this is Doc<Def, DocProps & Props>;
  }

  export type ServerData<Model extends ModelObjectType> = Data<
    Model,
    "present"
  >;

  export type AnyData<Model extends ModelObjectType> = Data<
    Model,
    ServerDateMissing
  >;

  export type Data<
    Model extends ModelObjectType,
    DateMissing extends ServerDateMissing,
  > = DataNullified<Nullify<Model>, DateMissing>;

  export type DataNullified<
    Model extends ModelObjectType,
    DateMissing extends ServerDateMissing,
  > = {
    [Key in keyof Model]: DataField<Model[Key], DateMissing>;
  };

  export type DataField<
    Field,
    DateMissing extends ServerDateMissing,
  > = Field extends ServerDate // Process server dates
    ? DateMissing extends "missing"
      ? Date | null
      : Date
    : Field extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
      ? Field
      : Field extends Array<infer ItemType>
        ? Array<DataField<ItemType, DateMissing>>
        : Field extends string | number // Special case for strings & numbers, so opaque types (string & {}) can be used
          ? Field
          : Field extends object // If it's an object, recursively pass through ModelData
            ? Data<Field, DateMissing>
            : Field;

  export type ResolvedWebServerDate<
    FromCache extends boolean,
    DateStrategy extends ServerDateStrategy,
  > = FromCache extends false | undefined // Server date is always defined when not from cache
    ? Date
    : DateStrategy extends "estimate" | "previous" // Or when the estimate or previous strategy were used
      ? Date
      : Date | null;

  /**
   * The document reference type.
   */
  export interface Ref<Def extends DocDef> extends DocAPI<Def> {
    type: "ref";
    collection: Collection<Def>;
    id: Def["Id"];
  }

  export type ServerDateMissing = "missing" | "present";

  export type ServerDateStrategy = "estimate" | "previous" | "none";

  export type RuntimeEnvironment = "server" | "client";

  export type DataSource = "cache" | "database";

  export interface ServerDate extends Date {
    __dontUseWillBeUndefined__: true;
  }

  export type DocData<
    Def extends DocDef,
    Props extends DocProps,
  > = Props["environment"] extends "server"
    ? ServerData<IntersectVariableModelType<Def["Model"]>>
    : Props["source"] extends "database"
      ? Data<IntersectVariableModelType<Def["Model"]>, "present">
      : Props["dateStrategy"] extends "estimate" | "previous"
        ? Data<IntersectVariableModelType<Def["Model"]>, "present">
        : Data<IntersectVariableModelType<Def["Model"]>, "missing">;

  export type WriteArg<Model extends ModelObjectType, Props extends DocProps> =
    | WriteData<Model, Props>
    | WriteGetter<Model, Props>;

  /**
   * Write model getter, accepts helper functions with special value generators
   * and returns {@link WriteData}.
   */
  export type WriteGetter<
    Model extends ModelObjectType,
    Props extends DocProps,
  > = ($: WriteHelpers<Model>) => WriteData<Model, Props>;

  export interface WriteHelpers<_Model> {
    serverDate(): ValueServerDate;

    remove(): ValueRemove;

    increment<NumberType extends number>(
      value: NumberType,
    ): ValueIncrement<NumberType>;

    arrayUnion<Type>(values: Type | Type[]): ValueArrayUnion<Type>;

    arrayRemove<Type>(values: Type | Type[]): ValueArrayRemove<Type>;
  }

  /**
   * Type of the data passed to write functions. It extends the model allowing
   * to set special values, sucha as server date, increment, etc.
   */
  export type WriteData<Model, Props extends DocProps> = WriteDataNullified<
    Nullify<Model>,
    Props
  >;

  export type WriteDataNullified<Model, Props extends DocProps> = {
    [Key in keyof Model]: WriteField<Model, Key, Props>;
  };

  export type WriteField<
    Data,
    Key extends keyof Data,
    Props extends DocProps,
  > = Exclude<Data[Key], undefined> extends infer Type // Exclude undefined
    ? // TODO:
      // > = Exclude<Data[Key], undefined | null> extends infer Type // Exclude undefined and null
      Type extends ServerDate // First, ensure ServerDate is properly set
      ? WriteFieldServerDate<Data, Key, Props>
      : // TODO:
        // : Type extends Ref<any> | Date | string | boolean | null | undefined
        //   ? Type
        Type extends Array<infer ItemType>
        ? WriteFieldArray<Data, Key, ItemType>
        : Type extends number
          ? WriteFieldNumber<Data, Key, Type>
          : Type extends object // If it's an object, recursively pass through SetModel
            ? WriteFieldObject<Data, Key, Props>
            : WriteFieldOther<Data, Key>
    : never;

  /**
   * Helper that adds undefined to the type if the origin type extends it.
   * Allows to set undefined to the fields that are altered with special values
   * like $.remove() or $.serverDate().
   */
  export type WriteFieldMaybeUndefined<
    OriginType,
    Value = OriginType,
  > = OriginType extends undefined ? Value | undefined : Value;

  export type WriteFieldServerDate<
    Model,
    Key extends keyof Model,
    Props extends DocProps,
  > = WriteFieldMaybeUndefined<
    Model[Key],
    Props["environment"] extends "server" // Date can be used only in the server environment
      ? Date | ValueServerDate | MaybeValueRemove<Model, Key>
      : ValueServerDate | MaybeValueRemove<Model, Key>
  >;

  export type WriteFieldArray<
    Model,
    Key extends keyof Model,
    ItemType,
  > = WriteFieldMaybeUndefined<
    Model[Key],
    | WriteArray<Array<ItemType>>
    | ValueArrayUnion<WriteArrayItem<ItemType>>
    | ValueArrayRemove<WriteArrayItem<ItemType>>
    | MaybeValueRemove<Model, Key>
  >;

  export type WriteArray<Data extends Array<any>> = Data extends Array<
    infer ItemType
  >
    ? Array<WriteArrayItem<ItemType>>
    : never;

  export type WriteArrayItem<Item> = Item extends ServerDate | Array<any> // No server dates and arrays are allowed in arrays
    ? never
    : Item extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
      ? // TODO:
        // : Item extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
        Item
      : Item extends object // If it's an object, recursively pass through WriteArrayObject
        ? WriteArrayObject<Item>
        : Item;

  export type WriteArrayObject<Data extends object & { length?: never }> = {
    [Key in keyof Data]: WriteArrayObjectField<Data[Key]>;
  };

  export type WriteArrayObjectField<Field> = Field extends ServerDate // No server dates are allowed in arrays
    ? never
    : Field extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
      ? // TODO:
        // : Field extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
        Field
      : Field extends Array<any>
        ? WriteArray<Field>
        : Field extends object // If it's an object, recursively pass through ModelData
          ? WriteArrayObject<Field>
          : Field;

  export type WriteFieldNumber<
    Model,
    Key extends keyof Model,
    NumberType extends number,
  > = Model[Key] | ValueIncrement<NumberType> | MaybeValueRemove<Model, Key>;

  export type WriteFieldOther<Model, Key extends keyof Model> =
    | Model[Key]
    | MaybeValueRemove<Model, Key>;

  export type WriteFieldObject<
    Model,
    Key extends keyof Model,
    Props extends DocProps,
  > =
    | WriteData<Model[Key], Props> // Even for update, nested objects are passed to set model
    | MaybeValueRemove<Model, Key>;

  /**
   * Available value kinds.
   */
  export type ValueKind =
    | "remove"
    | "increment"
    | "arrayUnion"
    | "arrayRemove"
    | "serverDate";

  /**
   * The remove value type.
   */
  export interface ValueRemove {
    type: "value";
    kind: "remove";
  }

  /**
   * The increment value type. It holds the increment value.
   */
  export interface ValueIncrement<NumberType extends number> {
    type: "value";
    kind: "increment";
    number: NumberType;
  }

  /**
   * The array union value type. It holds the payload to union.
   */
  export interface ValueArrayUnion<Type> {
    type: "value";
    kind: "arrayUnion";
    values: Type[];
  }

  /**
   * The array remove value type. It holds the data to remove from the target array.
   */
  export interface ValueArrayRemove<Type> {
    type: "value";
    kind: "arrayRemove";
    values: Type[];
  }

  /**
   * The server date value type.
   */
  export interface ValueServerDate {
    type: "value";
    kind: "serverDate";
  }

  export type MaybeValueRemoveOr<
    Model,
    Key extends keyof Model,
    ValueType,
  > = Partial<Pick<Model, Key>> extends Pick<Model, Key>
    ? ValueRemove | ValueType
    : ValueType;

  export type MaybeValueRemove<
    Model,
    Key extends keyof Model,
  > = Utils.RequiredKey<Model, Key> extends true ? never : ValueRemove;

  export type Undefined<T> = T extends undefined ? T : never;

  export interface SchemaHelpers {
    collection<
      Model extends ModelType,
      CustomId extends CustomIdConstrain = false,
    >(): PlainCollection<Model, CustomId>;
  }

  export interface OperationOptions<Environment extends RuntimeEnvironment> {
    as?: Environment;
  }

  export type SubscriptionErrorCallback = (error: unknown) => any;

  export type OffSubscription = () => void;

  export interface OffSubscriptionWithCatch {
    (): void;
    catch(callback: SubscriptionErrorCallback): OffSubscription;
  }

  export interface SubscriptionPromise<
    Request,
    Result,
    SubscriptionMeta = undefined,
  > extends Promise<Result> {
    request: Request;

    on: SubscriptionPromiseOn<Request, Result, SubscriptionMeta>;
  }

  export interface SubscriptionPromiseOn<
    Request,
    Result,
    SubscriptionMeta = undefined,
  > {
    (
      callback: SubscriptionPromiseCallback<Result, SubscriptionMeta>,
    ): OffSubscriptionWithCatch;

    request: Request;
  }

  export type SubscriptionPromiseCallback<
    Result,
    SubscriptionMeta = undefined,
  > = SubscriptionMeta extends undefined
    ? (result: Result) => void
    : (result: Result, meta: SubscriptionMeta) => void;

  export interface Request<Kind> {
    type: "request";
    kind: Kind;
    path: string;
    group?: boolean;
  }

  export interface GetRequest extends Request<"get"> {
    id: string;
  }

  export interface AllRequest extends Request<"all"> {}

  export interface ManyRequest extends Request<"many"> {
    ids: string;
  }

  export interface QueryRequest extends Request<"many"> {
    queries: Query.Query<any>[];
  }

  export interface DocAPI<Def extends DocDef> {
    get<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<GetRequest, Doc<Def, Props> | null>;

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      data: WriteArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      data: WriteArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    update: Update.DocFunction<Def>;

    remove(): Promise<Ref<Def>>;

    narrow<NarrowToModel extends ModelType>(
      fn: DocNarrowFunction<
        IntersectVariableModelType<Def["WideModel"]>,
        NarrowToModel
      >,
    ):
      | Doc<
          {
            Model: NarrowToModel;
            Name: Def["Name"];
            Id: Def["Id"];
            WideModel: Def["WideModel"];
            Flags: Def["Flags"] & { Reduced: true };
          },
          DocProps
        >
      | undefined;
  }

  export type DocNarrowFunction<
    InputModel extends ModelType,
    ExpectedModel extends ModelType,
  > = (data: InputModel) => false | ExpectedModel;

  export interface CollectionAPI<Def extends DocDef> {
    all<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<
      AllRequest,
      Doc<Def, Props>[],
      SubscriptionListMeta<Def, Props>
    >;

    query: Query.Function<Def>;

    count(): Promise<number>;
  }

  /**
   *
   */
  export interface Collection<Def extends DocDef> extends CollectionAPI<Def> {
    /** The collection type */
    type: "collection";

    /** The collection path */
    path: string;

    /** The collection name */
    name: string;

    get<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<GetRequest, Doc<Def, Props> | null>;

    many<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      ids: Def["Id"][],
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<ManyRequest, Array<Doc<Def, Props> | null>>;

    add<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      data: WriteArg<UnionVariableModelType<Def["Model"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: WriteArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: WriteArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    update: Update.CollectionFunction<Def>;

    remove(id: Def["Id"]): Promise<Ref<Def>>;

    ref(id: Def["Id"]): Ref<Def>;

    doc<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      snapshot: Firebase.Snapshot,
    ): Doc<Def, Props> | null;

    doc<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: DocData<Def, Props>,
      options?: OperationOptions<Environment>,
    ): Doc<Def, Props>;

    /**
     * Cast a string to typed document id.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @param id - the string to cast to the typed document id
     * @returns typed document id
     *
     * @example
     * const commentId = db.comments.id('t2nNOgoQY8a5vcvWl1yAz26Ue7k2')
     */
    id(id: string): Def["Id"];

    /**
     * Generate random document id using Firebase.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @returns promise to random typed document id
     *
     * @example
     * const newCommentId = await db.comments.id()
     */
    id(): Promise<Def["Id"]>;
  }

  export interface CollectionConfig {
    path?: string;
  }

  export interface NestedCollection<Def extends DocDef, Schema extends AnyDB>
    extends Collection<Def> {
    (id: Def["Id"]): Schema;

    schema: Schema;

    sub: NestedCollectionShortcuts<Schema>;
  }

  export type NestedCollectionShortcuts<Schema extends AnyDB> = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends NestedCollection<infer Def, infer Schema>
        ? NestedCollectionShortcut<Def, Schema>
        : Schema[Path] extends Collection<infer Def>
          ? CollectionShortcut<Def>
          : Schema[Path]
      : never;
  };

  export interface CollectionShortcut<Def extends DocDef> {
    /**
     * Cast a string to typed document id.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @param id - the string to cast to the typed document id
     * @returns typed document id
     *
     * @example
     * const commentId = db.posts.sub.comments.id('t2nNOgoQY8a5vcvWl1yAz26Ue7k2')
     */
    id(id: string): Def["Id"];

    /**
     * Generate random document id using Firebase.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @returns promise to random typed document id
     *
     * @example
     * const newCommentId = await db.posts.sub.comments.id()
     */
    id(): Promise<Def["Id"]>;
  }

  export interface NestedCollectionShortcut<
    Def extends DocDef,
    Schema extends AnyDB,
  > extends CollectionShortcut<Def> {
    sub: NestedCollectionShortcuts<Schema>;
  }

  export type AnyCollection<Def extends DocDef> =
    | Collection<Def>
    | NestedCollection<Def, AnyDB>;

  export interface PlainCollection<
    Model extends ModelType,
    CustomId extends CustomIdConstrain = false,
    CustomName extends string | false = false,
  > {
    /** The collection type */
    type: "collection";

    sub<Schema extends PlainSchema>(
      schema: Schema,
    ): NestedPlainCollection<Model, Schema, CustomId, CustomName>;

    name<Path extends string>(
      name: Path,
    ): PlainCollection<Model, CustomId, Path>;
  }

  export interface NestedPlainCollection<
    _Model extends ModelType,
    Schema extends PlainSchema,
    _CustomId extends CustomIdConstrain = false,
    _CustomName extends string | false = false,
  > {
    /** The collection type */
    type: "collection";

    schema: Schema;
  }

  export type AnyPlainCollection =
    | PlainCollection<any>
    | NestedPlainCollection<any, PlainSchema>;

  export interface PlainSchema {
    [Path: string | symbol]:
      | PlainCollection<any>
      | NestedPlainCollection<any, PlainSchema>;
  }

  export interface AnyDB {
    [CollectionPath: string]: AnyCollection<any>;
  }

  export type DB<Schema, BasePath extends string | false = false> = {
    [Name in keyof Schema]: Name extends string
      ? Schema[Name] extends NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId,
          infer CustomName
        >
        ? NestedCollection<
            {
              Model: Model;
              Name: CustomName extends string ? CustomName : Name;
              Id: CustomId extends Id<any> | string
                ? CustomId
                : Id<Utils.ComposePath<BasePath, Name>>;
              WideModel: Model;
              Flags: DocDefFlags;
            },
            DB<Schema, Utils.ComposePath<BasePath, Name>>
          >
        : Schema[Name] extends PlainCollection<
              infer Model,
              infer CustomId,
              infer CustomName
            >
          ? Collection<{
              Model: Model;
              Name: CustomName extends string ? CustomName : Name;
              Id: CustomId extends Id<any> | string
                ? CustomId
                : Id<Utils.ComposePath<BasePath, Name>>;
              WideModel: Model;
              Flags: DocDefFlags;
            }>
          : never
      : never;
  };

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
      | Collection<infer Def>
      | NestedCollection<infer Def, any>
      ? {
          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#sub).
           */
          sub: DB[Path] extends NestedCollection<
            any,
            infer Schema extends TypesaurusCore.DB<any, any>
          >
            ? InferSchema<Schema>
            : never;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#def).
           */
          Def: Def;

          /**
           * The documents' id.
           *
           * Essentially it's a string, but TypeScript will force you to use
           * `.toString()` to cast it to `string`.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#id).
           */
          Id: Def["Id"];

          /**
           * The documents' reference, contains its id and collection.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#ref).
           */
          Ref: TypesaurusCore.Ref<Def>;

          /**
           * The document instance, contains reference with id and collection
           * and document data.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#doc).
           */
          Doc: TypesaurusCore.Doc<Def, DocProps>;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#model).
           */
          Model: IntersectVariableModelType<Def["Model"]>;

          /**
           * The document data. It differs from the interface used to define
           * the collection by Firestore nuances such as undefined turned into
           * nulls, and nullable dates. A variable model is also resolved.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#data).
           */
          Data: Data<
            IntersectVariableModelType<Def["Model"]>,
            ServerDateMissing
          >;

          /**
           * Read result, either doc, `null` (not found) or `undefined`
           * (the read is not finished/started yet).
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#result).
           */
          Result: Doc<Def, DocProps> | null | undefined;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-arg).
           */
          WriteArg: WriteArg<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-data).
           */
          WriteData: WriteData<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-getter).
           */
          WriteGetter: WriteGetter<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * Write helpers type allows to abstract write building (for add, set
           * and upset methods) login into functions by accepting it as
           * an argument.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-helpers).
           */
          WriteHelpers: WriteHelpers<Def["Model"]>;

          /**
           * Update builder type allows to abstract update building login into
           * functions by accepting it as an argument.
           *
           * Unlike UpdateHelpers, UpdateBuilder can be used asynchronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-builder).
           */
          UpdateBuilder: Update.Builder<Def, DocProps>;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-arg).
           */
          UpdateArg: Update.Arg<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-data).
           */
          UpdateData: Update.Data<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-getter).
           */
          UpdateGetter: Update.Getter<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * Update helpers type allows to abstract update building login into
           * functions by accepting it as an argument.
           *
           * Unlike UpdateBuilder, UpdateHelpers must be used syncronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-helpers).
           */
          UpdateHelpers: Update.Helpers<Def, DocProps>;

          /**
           * Query builder type allows to abstract query building login into
           * functions by accepting it as an argument.
           *
           * Unlike QueryHelpers, QueryBuilder can be used asynchronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-builder).
           */
          QueryBuilder: Query.Builder<Def, DocProps>;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-data).
           */
          QueryData: Query.Data<Def>;

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-getter).
           */
          QueryGetter: Query.Getter<Def>;

          /**
           * Query helpers type allows to abstract query building login into
           * functions by accepting it as an argument.
           *
           * Unlike QueryBuilder, QueryHelpers must be used syncronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-helpers).
           */
          QueryHelpers: Query.Helpers<Def>;

          /**
           * The server version of Doc, where the server dates are always
           * resolved (not-null).
           *
           * The document instance, contains reference with id and collection
           * and document data.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#server-doc).
           */
          ServerDoc: TypesaurusCore.Doc<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The server version of Data, where the server dates are always
           * resolved (not-null).
           *
           * The document data. It differs from the interface used to define
           * the collection by Firestore nuances such as undefined turned into
           * nulls, and nullable dates. A variable model is also resolved.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#server-data).
           */
          ServerData: ServerData<IntersectVariableModelType<Def["Model"]>>;

          /**
           * The server version of Result, where the server dates are always
           * resolved (not-null).
           *
           * Read result, either doc, `null` (not found) or `undefined`
           * (the read is not finished/started yet).
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#result).
           */
          ServerResult: Doc<Def, DocProps> | null | undefined;

          /**
           * The server version of WriteArg, where the Date can be used
           * in place of a server date.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-arg).
           */
          ServerWriteArg: WriteArg<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * The server version of WriteData, where the Date can be used
           * in place of a server date.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-data).
           */
          ServerWriteData: WriteData<
            IntersectVariableModelType<Def["Model"]>,
            DocProps & { environment: "server" }
          >;

          /**
           * The server version of WriteGetter, where the Date can be used
           * in place of a server date.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-getter).
           */
          ServerWriteGetter: WriteGetter<
            IntersectVariableModelType<Def["Model"]>,
            DocProps & { environment: "server" }
          >;

          /**
           * The server version of UpdateBuilder, where the Date can be used
           * in place of a server date.
           *
           * Update builder type allows to abstract update building login into
           * functions by accepting it as an argument.
           *
           * Unlike UpdateHelpers, UpdateBuilder can be used asynchronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-builder).
           */
          ServerUpdateBuilder: Update.Builder<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The server version of UpdateArg, where the Date can be used
           * in place of a server date.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-arg).
           */
          ServerUpdateArg: Update.Arg<
            IntersectVariableModelType<Def["Model"]>,
            DocProps & { environment: "server" }
          >;

          /**
           * The server version of UpdateData, where the Date can be used
           * in place of a server date.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-data).
           */
          ServerUpdateData: Update.Data<
            IntersectVariableModelType<Def["Model"]>,
            DocProps & { environment: "server" }
          >;

          /**
           * The server version of UpdateGetter, where the Date can be used
           * in place of a server date.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-getter).
           */
          ServerUpdateGetter: Update.Getter<
            IntersectVariableModelType<Def["Model"]>,
            DocProps & { environment: "server" }
          >;

          /**
           * The server version of UpdateHelpers, where the Date can be used
           * in place of a server date.
           *
           * Update helpers type allows to abstract update building login into
           * functions by accepting it as an argument.
           *
           * Unlike UpdateBuilder, UpdateHelpers must be used syncronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-helpers).
           */
          ServerUpdateHelpers: Update.Helpers<
            Def,
            DocProps & { environment: "server" }
          >;
        }
      : never;
  };

  /**
   * Narrow doc type. If your doc has multiple shapes, the type will help you
   * narrow down data type to a specific type.
   */
  export type NarrowDoc<
    OriginalDoc extends Doc<any, any>,
    NarrowToModel extends ModelObjectType,
  > = OriginalDoc extends Doc<
    infer Def extends DocDef,
    infer Props extends DocProps
  >
    ? NarrowToModel extends IntersectVariableModelType<Def["WideModel"]>
      ? Doc<
          {
            Model: NarrowToModel;
            Name: Def["Name"];
            Id: Def["Id"];
            WideModel: Def["WideModel"];
            Flags: Def["Flags"] & { Reduced: true };
          },
          Props
        >
      : never
    : never;

  /**
   * Normalizes server dates in an object. It replaces ServerDate with regular Date. It's useful when reusing interfaces
   * in a non-Typesaurus environment or when you need to store it in an array (where server dates are not allowed).
   */
  export type NormalizeServerDates<Interface> = {
    [Key in keyof Interface]: Interface[Key] extends ServerDate
      ? Date
      : NormalizeServerDates<Interface[Key]>;
  };

  /**
   * The options. It allows to configure the Firebase settings.
   */
  export interface Options {
    /** The app name. */
    app?: string;
    /** The server options. */
    server?: OptionsServer;
    /** The client options. */
  }

  /**
   * The server options.
   */
  export interface OptionsServer {
    /** The server app name. It takes priority over the root's app name. */
    app?: string;
    /** The option forces Firestore the use of REST transport until an operation
     * requires gRPC. It helps to speed up the cold start of the Functions. */
    preferRest?: boolean;
  }

  /**
   * The client options.
   */
  export interface OptionsServer {
    /** The client app name. It takes priority over the root's app name. */
    app?: string;
  }

  /**
   * Deeply adds null to all undefined values.
   */
  export type Nullify<Type> =
    // First we extract null and undefined
    Type extends null | undefined
      ? Type | null
      : // Now we extract as-is types
        Type extends string | number | boolean | Date | ServerDate | Ref<any>
        ? Type
        : // Now extract array types
          Type extends Array<infer Item>
          ? Array<Nullify<Item>>
          : // Now extract object types
            Type extends object
            ? {
                [Key in keyof Type]: Utils.ActuallyUndefined<
                  // If field is optionally undefined, exclude undefined before nullifing the rest
                  Type,
                  Key
                > extends true
                  ? Nullify<Type[Key]>
                  : Nullify<Exclude<Type[Key], undefined>>;
              }
            : never;
}
