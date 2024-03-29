export namespace TypesaurusUtils {
  /**
   * Falsy type.
   */
  export type Falsy = undefined | null | "" | false | 0;

  /**
   * Any brand type that can be mixed with string number or symbol to create
   * opaque primitive.
   */
  export type AnyBrand = { [key: string | number | symbol]: any };

  /**
   * Picks only keys of the given type.
   */
  export type KeysOfType<Base, Type> = {
    [Key in keyof Base]: Type extends Base[Key] ? Key : never;
  }[keyof Base];

  /**
   * Removes brand from the given type.
   */
  export type Debrand<Type> = Type extends infer _Brand extends AnyBrand &
    infer Debranded extends string | number | symbol
    ? Debranded
    : Type;

  /**
   * Composes collection path from base path and collection name.
   */
  export type ComposePath<
    BasePath extends string | false,
    Path extends string,
  > = BasePath extends false ? Path : `${BasePath}/${Path}`;

  /**
   * Resolves union keys.
   */
  export type UnionKeys<Type> = Type extends Type ? keyof Type : never;

  /**
   * Resolves union value.
   */
  export type UnionValue<
    Type,
    UnionKey extends UnionKeys<Type>,
  > = Type extends {
    [Key in UnionKey]: unknown;
  }
    ? Type[UnionKey]
    : never;

  /**
   * Removes indexed fields leaving only statically defined.
   */
  export type WithoutIndexed<Model> = {
    [Key in keyof Model as string extends Debrand<Key>
      ? never
      : number extends Debrand<Key>
        ? never
        : symbol extends Debrand<Key>
          ? never
          : Key]: Model[Key];
  };

  /**
   * Resolves true if the given key is statically defined in the given type.
   */
  export type StaticKey<
    Model,
    Key extends keyof Model,
  > = Key extends keyof WithoutIndexed<Model> ? true : false;

  /**
   * Returns a type with all fields required and all values exclude undefined.
   * It allows to extract key paths from nested objects with optional keys
   * and values.
   */
  export type AllRequired<Model> = {
    [Key in keyof Required<Model>]-?: Exclude<
      Required<Model>[Key],
      undefined | null
    >;
  };

  /**
   * Resolves true if the passed key is a required field of the passed model.
   */
  export type RequiredKey<Model, Key extends keyof Model> =
    StaticKey<Model, Key> extends true
      ? Partial<Pick<Model, Key>> extends Pick<Model, Key>
        ? false
        : true
      : false;

  /**
   * Resolves true if the passed field is undefined union and not optionally
   * undefined.
   */
  export type ActuallyUndefined<
    Model,
    Key extends keyof Model,
  > = undefined extends Required<Model>[Key] ? true : false;

  /**
   * Resolves true if all sibling fields in the passed model are optional.
   */
  export type AllOptionalBut<Model, Key extends keyof Model> =
    Partial<Omit<WithoutIndexed<Model>, Key>> extends Omit<
      WithoutIndexed<Model>,
      Key
    >
      ? true
      : false;

  /**
   * Resolves true if the passed path to a field within a nested object
   * is required on every nesting level. It helps to prevent updates from
   * causing data inconsistency.
   *
   * This is the 1-lever deep version, see RequiredPathN for more levels.
   *
   * See {@link RequiredPath2} for the internal implementation details.
   */
  export type RequiredPath1<Model, Key1 extends keyof Model> =
    RequiredKey<Model, Key1> extends true ? true : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   *
   * This is the 2-level deep version of the type.
   */
  export type RequiredPath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
  > =
    RequiredPath1<Model, Key1> extends true // Check if the path is safe up to this level
      ? RequiredKey<AllRequired<Model>[Key1], Key2> extends true // Check if the given field is required
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 3-level deep version of the type.
   */
  export type RequiredPath3<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
  > =
    RequiredPath2<Model, Key1, Key2> extends true
      ? RequiredKey<
          AllRequired<AllRequired<Model>[Key1]>[Key2],
          Key3
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 4-level deep version of the type.
   */
  export type RequiredPath4<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
  > =
    RequiredPath3<Model, Key1, Key2, Key3> extends true
      ? RequiredKey<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
          Key4
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 5-level deep version of the type.
   */
  export type RequiredPath5<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
  > =
    RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
      ? RequiredKey<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4],
          Key5
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 6-level deep version of the type.
   */
  export type RequiredPath6<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
  > =
    RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
      ? RequiredKey<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5],
          Key6
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 7-level deep version of the type.
   */
  export type RequiredPath7<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
  > =
    RequiredPath6<Model, Key1, Key2, Key3, Key4, Key5, Key6> extends true
      ? RequiredKey<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
              >[Key4]
            >[Key5]
          >[Key6],
          Key7
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 8-level deep version of the type.
   */
  export type RequiredPath8<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
  > =
    RequiredPath7<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7> extends true
      ? RequiredKey<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7],
          Key8
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 9-level deep version of the type.
   */
  export type RequiredPath9<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
    Key9 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >[Key8],
  > =
    RequiredPath8<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8
    > extends true
      ? RequiredKey<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<AllRequired<Model>[Key1]>[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6]
            >[Key7]
          >[Key8],
          Key9
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link RequiredPath1} for the documentation.
   * See {@link RequiredPath2} for the internal implementation details.
   *
   * This is the 10-level deep version of the type.
   */
  export type RequiredPath10<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
    Key9 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >[Key8],
    Key10 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8]
    >[Key9],
  > =
    RequiredPath9<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8,
      Key9
    > extends true
      ? RequiredKey<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3]
                    >[Key4]
                  >[Key5]
                >[Key6]
              >[Key7]
            >[Key8]
          >[Key9],
          Key10
        > extends true
        ? true
        : false
      : false;

  /**
   * Resolves true if the passed optional path to a field within a nested object
   * is safe to update, meaning there are no required sibling fields on every
   * nesting level. It helps to prevent updates from causing data inconsistency.
   *
   * This is the 1-lever deep version, see SafeOptionalPathN for more levels.
   *
   * See {@link SafeOptionalPath2} for the internal implementation details.
   */
  export type SafeOptionalPath1<Model, Key1 extends keyof Model> =
    AllOptionalBut<Model, Key1> extends true ? true : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   *
   * This is the 2-level deep version of the type.
   */
  export type SafeOptionalPath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
  > =
    SafeOptionalPath1<Model, Key1> extends true // Check if the path is safe up to this level
      ? AllOptionalBut<AllRequired<Model>[Key1], Key2> extends true // Checks if there are no required sibling fields
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 3-level deep version of the type.
   */
  export type SafeOptionalPath3<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
  > =
    SafeOptionalPath2<Model, Key1, Key2> extends true
      ? AllOptionalBut<
          AllRequired<AllRequired<Model>[Key1]>[Key2],
          Key3
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 4-level deep version of the type.
   */
  export type SafeOptionalPath4<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
  > =
    SafeOptionalPath3<Model, Key1, Key2, Key3> extends true
      ? AllOptionalBut<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
          Key4
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 5-level deep version of the type.
   */
  export type SafeOptionalPath5<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
  > =
    SafeOptionalPath4<Model, Key1, Key2, Key3, Key4> extends true
      ? AllOptionalBut<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4],
          Key5
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 6-level deep version of the type.
   */
  export type SafeOptionalPath6<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
  > =
    SafeOptionalPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
      ? AllOptionalBut<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5],
          Key6
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 7-level deep version of the type.
   */
  export type SafeOptionalPath7<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
  > =
    SafeOptionalPath6<Model, Key1, Key2, Key3, Key4, Key5, Key6> extends true
      ? AllOptionalBut<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
              >[Key4]
            >[Key5]
          >[Key6],
          Key7
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 8-level deep version of the type.
   */
  export type SafeOptionalPath8<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
  > =
    SafeOptionalPath7<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7
    > extends true
      ? AllOptionalBut<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7],
          Key8
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 9-level deep version of the type.
   */
  export type SafeOptionalPath9<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
    Key9 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >[Key8],
  > =
    SafeOptionalPath8<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8
    > extends true
      ? AllOptionalBut<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<AllRequired<Model>[Key1]>[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6]
            >[Key7]
          >[Key8],
          Key9
        > extends true
        ? true
        : false
      : false;

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   * See {@link SafeOptionalPath2} for the internal implementation details.
   *
   * This is the 10-level deep version of the type.
   */
  export type SafeOptionalPath10<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
    Key9 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >[Key8],
    Key10 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8]
    >[Key9],
  > =
    SafeOptionalPath9<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8,
      Key9
    > extends true
      ? AllOptionalBut<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3]
                    >[Key4]
                  >[Key5]
                >[Key6]
              >[Key7]
            >[Key8]
          >[Key9],
          Key10
        > extends true
        ? true
        : false
      : false;

  /**
   * Resolves true if the passed path to a field within a nested object is
   * safe to update.
   *
   * It checks using {@link RequiredPath1} if the path is required at every
   * level, and if not, with the help of {@link SafeOptionalPath1} it checks if
   * the optional path to a given level is safe. Refer to said functions for
   * more details on how it works.
   *
   * This is the 1-lever deep version, see SafePathN for more levels.
   *
   * See {@link SafePath5} for the internal implementation details.
   */
  export type SafePath1<Model, _Key1 extends keyof Model> = true;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 2-level deep version of the type.
   */
  export type SafePath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
  > = AllRequired<Model>[Key1] extends any[]
    ? false
    : RequiredPath1<Model, Key1> extends true
      ? true
      : SafeOptionalPath1<AllRequired<Model>[Key1], Key2>;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 3-level deep version of the type.
   */
  export type SafePath3<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
  > = AllRequired<AllRequired<Model>[Key1]>[Key2] extends any[]
    ? false
    : RequiredPath2<Model, Key1, Key2> extends true
      ? true
      : SafeOptionalPath2<AllRequired<Model>[Key1], Key2, Key3>;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 4-level deep version of the type.
   */
  export type SafePath4<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
  > = AllRequired<
    AllRequired<AllRequired<Model>[Key1]>[Key2]
  >[Key3] extends any[]
    ? false
    : RequiredPath3<Model, Key1, Key2, Key3> extends true
      ? true
      : SafeOptionalPath3<AllRequired<Model>[Key1], Key2, Key3, Key4>;

  /**
   * See {@link SafePath1} for the documentation.
   *
   * This is the 5-level deep version of the type.
   */
  export type SafePath5<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
  > =
    // If the parent is an array, the path is never safe.
    AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4] extends any[]
      ? false
      : // If the path is required at every level but last, resolve true.
        //
        // We don't need to check the last level (Key3) in this case because if
        // the Key2 is required, when every field in it can be safely updated
        // otherwise it would't be set.
        RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
        ? true
        : // Otherwise check if it's required at one level lower...
          RequiredPath3<Model, Key1, Key2, Key3> extends true
          ? // ...and if it is, check if the optional path from that lower level
            // is safe.
            //
            // Here we check the last two keys of the path.
            SafeOptionalPath2<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
              Key4,
              Key5
            >
          : // Repeat the same one more lever lower...
            RequiredPath2<Model, Key1, Key2> extends true
            ? SafeOptionalPath3<
                AllRequired<AllRequired<Model>[Key1]>[Key2],
                Key3,
                Key4,
                Key5
              >
            : // ...until we reach the first level where we can simply check the whole
              // path.
              //
              // We don't check the root level and start at thefirst level (Key1)
              // because it's always safe as missing document can't be updated.
              SafeOptionalPath4<
                AllRequired<Model>[Key1],
                Key2,
                Key3,
                Key4,
                Key5
              >;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 6-level deep version of the type.
   */
  export type SafePath6<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
  > = AllRequired<
    AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4]
  >[Key5] extends any[]
    ? false
    : RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
      ? true
      : RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
        ? SafeOptionalPath2<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4],
            Key5,
            Key6
          >
        : RequiredPath3<Model, Key1, Key2, Key3> extends true
          ? SafeOptionalPath3<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
              Key4,
              Key5,
              Key6
            >
          : RequiredPath2<Model, Key1, Key2> extends true
            ? SafeOptionalPath4<
                AllRequired<AllRequired<Model>[Key1]>[Key2],
                Key3,
                Key4,
                Key5,
                Key6
              >
            : SafeOptionalPath5<
                AllRequired<Model>[Key1],
                Key2,
                Key3,
                Key4,
                Key5,
                Key6
              >;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 7-level deep version of the type.
   */
  export type SafePath7<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
  > = AllRequired<
    AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5]
  >[Key6] extends any[]
    ? false
    : RequiredPath6<Model, Key1, Key2, Key3, Key4, Key5, Key6> extends true
      ? true
      : RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
        ? SafeOptionalPath2<
            AllRequired<
              AllRequired<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
              >[Key4]
            >[Key5],
            Key6,
            Key7
          >
        : RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
          ? SafeOptionalPath3<
              AllRequired<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
              >[Key4],
              Key5,
              Key6,
              Key7
            >
          : RequiredPath3<Model, Key1, Key2, Key3> extends true
            ? SafeOptionalPath4<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
                Key4,
                Key5,
                Key6,
                Key7
              >
            : RequiredPath2<Model, Key1, Key2> extends true
              ? SafeOptionalPath5<
                  AllRequired<AllRequired<Model>[Key1]>[Key2],
                  Key3,
                  Key4,
                  Key5,
                  Key6,
                  Key7
                >
              : SafeOptionalPath6<
                  AllRequired<Model>[Key1],
                  Key2,
                  Key3,
                  Key4,
                  Key5,
                  Key6,
                  Key7
                >;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 8-level deep version of the type.
   */
  export type SafePath8<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
  > = AllRequired<
    AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6]
  >[Key7] extends any[]
    ? false
    : RequiredPath7<
          Model,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
      ? true
      : RequiredPath6<Model, Key1, Key2, Key3, Key4, Key5, Key6> extends true
        ? SafeOptionalPath2<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
                >[Key4]
              >[Key5]
            >[Key6],
            Key7,
            Key8
          >
        : RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
          ? SafeOptionalPath3<
              AllRequired<
                AllRequired<
                  AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
                >[Key4]
              >[Key5],
              Key6,
              Key7,
              Key8
            >
          : RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
            ? SafeOptionalPath4<
                AllRequired<
                  AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
                >[Key4],
                Key5,
                Key6,
                Key7,
                Key8
              >
            : RequiredPath3<Model, Key1, Key2, Key3> extends true
              ? SafeOptionalPath5<
                  AllRequired<
                    AllRequired<AllRequired<Model>[Key1]>[Key2]
                  >[Key3],
                  Key4,
                  Key5,
                  Key6,
                  Key7,
                  Key8
                >
              : RequiredPath2<Model, Key1, Key2> extends true
                ? SafeOptionalPath6<
                    AllRequired<AllRequired<Model>[Key1]>[Key2],
                    Key3,
                    Key4,
                    Key5,
                    Key6,
                    Key7,
                    Key8
                  >
                : SafeOptionalPath7<
                    AllRequired<Model>[Key1],
                    Key2,
                    Key3,
                    Key4,
                    Key5,
                    Key6,
                    Key7,
                    Key8
                  >;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 9-level deep version of the type.
   */
  export type SafePath9<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
    Key9 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >[Key8],
  > = AllRequired<
    AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7]
  >[Key8] extends any[]
    ? false
    : RequiredPath8<
          Model,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8
        > extends true
      ? true
      : RequiredPath7<
            Model,
            Key1,
            Key2,
            Key3,
            Key4,
            Key5,
            Key6,
            Key7
          > extends true
        ? SafeOptionalPath2<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<AllRequired<Model>[Key1]>[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6]
            >[Key7],
            Key8,
            Key9
          >
        : RequiredPath6<Model, Key1, Key2, Key3, Key4, Key5, Key6> extends true
          ? SafeOptionalPath3<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<AllRequired<Model>[Key1]>[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6],
              Key7,
              Key8,
              Key9
            >
          : RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
            ? SafeOptionalPath4<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<AllRequired<Model>[Key1]>[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5],
                Key6,
                Key7,
                Key8,
                Key9
              >
            : RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
              ? SafeOptionalPath5<
                  AllRequired<
                    AllRequired<
                      AllRequired<AllRequired<Model>[Key1]>[Key2]
                    >[Key3]
                  >[Key4],
                  Key5,
                  Key6,
                  Key7,
                  Key8,
                  Key9
                >
              : RequiredPath3<Model, Key1, Key2, Key3> extends true
                ? SafeOptionalPath6<
                    AllRequired<
                      AllRequired<AllRequired<Model>[Key1]>[Key2]
                    >[Key3],
                    Key4,
                    Key5,
                    Key6,
                    Key7,
                    Key8,
                    Key9
                  >
                : RequiredPath2<Model, Key1, Key2> extends true
                  ? SafeOptionalPath7<
                      AllRequired<AllRequired<Model>[Key1]>[Key2],
                      Key3,
                      Key4,
                      Key5,
                      Key6,
                      Key7,
                      Key8,
                      Key9
                    >
                  : SafeOptionalPath8<
                      AllRequired<Model>[Key1],
                      Key2,
                      Key3,
                      Key4,
                      Key5,
                      Key6,
                      Key7,
                      Key8,
                      Key9
                    >;

  /**
   * See {@link SafePath1} for the documentation.
   * See {@link SafePath5} for the internal implementation details.
   *
   * This is the 10-level deep version of the type.
   */
  export type SafePath10<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4],
    Key6 extends keyof AllRequired<
      AllRequired<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
      >[Key4]
    >[Key5],
    Key7 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4]
      >[Key5]
    >[Key6],
    Key8 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >[Key7],
    Key9 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >[Key8],
    Key10 extends keyof AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<
                AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8]
    >[Key9],
  > = AllRequired<
    AllRequired<
      AllRequired<
        AllRequired<
          AllRequired<
            AllRequired<
              AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >[Key8]
  >[Key9] extends any[]
    ? false
    : RequiredPath9<
          Model,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8,
          Key9
        > extends true
      ? true
      : RequiredPath8<
            Model,
            Key1,
            Key2,
            Key3,
            Key4,
            Key5,
            Key6,
            Key7,
            Key8
          > extends true
        ? SafeOptionalPath2<
            AllRequired<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3]
                    >[Key4]
                  >[Key5]
                >[Key6]
              >[Key7]
            >[Key8],
            Key9,
            Key10
          >
        : RequiredPath7<
              Model,
              Key1,
              Key2,
              Key3,
              Key4,
              Key5,
              Key6,
              Key7
            > extends true
          ? SafeOptionalPath3<
              AllRequired<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3]
                    >[Key4]
                  >[Key5]
                >[Key6]
              >[Key7],
              Key8,
              Key9,
              Key10
            >
          : RequiredPath6<
                Model,
                Key1,
                Key2,
                Key3,
                Key4,
                Key5,
                Key6
              > extends true
            ? SafeOptionalPath4<
                AllRequired<
                  AllRequired<
                    AllRequired<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3]
                    >[Key4]
                  >[Key5]
                >[Key6],
                Key7,
                Key8,
                Key9,
                Key10
              >
            : RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
              ? SafeOptionalPath5<
                  AllRequired<
                    AllRequired<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3]
                    >[Key4]
                  >[Key5],
                  Key6,
                  Key7,
                  Key8,
                  Key9,
                  Key10
                >
              : RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
                ? SafeOptionalPath6<
                    AllRequired<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3]
                    >[Key4],
                    Key5,
                    Key6,
                    Key7,
                    Key8,
                    Key9,
                    Key10
                  >
                : RequiredPath3<Model, Key1, Key2, Key3> extends true
                  ? SafeOptionalPath7<
                      AllRequired<
                        AllRequired<AllRequired<Model>[Key1]>[Key2]
                      >[Key3],
                      Key4,
                      Key5,
                      Key6,
                      Key7,
                      Key8,
                      Key9,
                      Key10
                    >
                  : RequiredPath2<Model, Key1, Key2> extends true
                    ? SafeOptionalPath8<
                        AllRequired<AllRequired<Model>[Key1]>[Key2],
                        Key3,
                        Key4,
                        Key5,
                        Key6,
                        Key7,
                        Key8,
                        Key9,
                        Key10
                      >
                    : SafeOptionalPath9<
                        AllRequired<Model>[Key1],
                        Key2,
                        Key3,
                        Key4,
                        Key5,
                        Key6,
                        Key7,
                        Key8,
                        Key9,
                        Key10
                      >;

  export type SharedShape<
    A,
    B,
    C = undefined,
    D = undefined,
    E = undefined,
    F = undefined,
    G = undefined,
    H = undefined,
    I = undefined,
    J = undefined,
  > = C extends undefined
    ? SharedShape2<A, B>
    : D extends undefined
      ? SharedShape3<A, B, C>
      : E extends undefined
        ? SharedShape4<A, B, C, D>
        : F extends undefined
          ? SharedShape5<A, B, C, D, E>
          : G extends undefined
            ? SharedShape6<A, B, C, D, E, F>
            : H extends undefined
              ? SharedShape7<A, B, C, D, E, F, G>
              : I extends undefined
                ? SharedShape8<A, B, C, D, E, F, G, H>
                : J extends undefined
                  ? SharedShape9<A, B, C, D, E, F, G, H, I>
                  : SharedShape10<A, B, C, D, E, F, G, H, I, J>;

  export type SharedShape2<A, B> = {
    [Key in keyof (A | B) as A[Key] & B[Key] extends never
      ? never
      : Key]: A[Key] & B[Key];
  };

  export type SharedShape3<A, B, C> = {
    [Key in keyof (A | B | C) as A[Key] & B[Key] & C[Key] extends never
      ? never
      : Key]: A[Key] & B[Key] & C[Key];
  };

  export type SharedShape4<A, B, C, D> = {
    [Key in keyof (A | B | C | D) as A[Key] &
      B[Key] &
      C[Key] &
      D[Key] extends never
      ? never
      : Key]: A[Key] & B[Key] & C[Key] & D[Key];
  };

  export type SharedShape5<A, B, C, D, E> = {
    [Key in keyof (A | B | C | D | E) as [Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] extends never
      ? never
      : Key]: A[Key] & B[Key] & C[Key] & D[Key] & E[Key];
  };

  export type SharedShape6<A, B, C, D, E, F> = {
    [Key in keyof (A | B | C | D | E | F) as A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] extends never
      ? never
      : Key]: A[Key] & B[Key] & C[Key] & D[Key] & E[Key] & F[Key];
  };

  export type SharedShape7<A, B, C, D, E, F, G> = {
    [Key in keyof (A | B | C | D | E | F | G) as A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] &
      G[Key] extends never
      ? never
      : Key]: A[Key] & B[Key] & C[Key] & D[Key] & E[Key] & F[Key] & G[Key];
  };

  export type SharedShape8<A, B, C, D, E, F, G, H> = {
    [Key in keyof (A | B | C | D | E | F | G | H) as A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] &
      G[Key] &
      H[Key] extends never
      ? never
      : Key]: A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] &
      G[Key] &
      H[Key];
  };

  export type SharedShape9<A, B, C, D, E, F, G, H, I> = {
    [Key in keyof (A | B | C | D | E | F | G | H | I) as A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] &
      G[Key] &
      H[Key] &
      I[Key] extends never
      ? never
      : Key]: A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] &
      G[Key] &
      H[Key] &
      I[Key];
  };

  export type SharedShape10<A, B, C, D, E, F, G, H, I, J> = {
    [Key in keyof (A | B | C | D | E | F | G | H | I | J) as A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] &
      G[Key] &
      H[Key] &
      I[Key] &
      J[Key] extends never
      ? never
      : Key]: A[Key] &
      B[Key] &
      C[Key] &
      D[Key] &
      E[Key] &
      F[Key] &
      G[Key] &
      H[Key] &
      I[Key] &
      J[Key];
  };

  /**
   * Creates type where all fields from all variants are present.
   */
  export type IntersectShape<
    A,
    B,
    C = undefined,
    D = undefined,
    E = undefined,
    F = undefined,
    G = undefined,
    H = undefined,
    I = undefined,
    J = undefined,
  > = C extends undefined
    ? IntersectShape2<A, B>
    : D extends undefined
      ? IntersectShape3<A, B, C>
      : E extends undefined
        ? IntersectShape4<A, B, C, D>
        : F extends undefined
          ? IntersectShape5<A, B, C, D, E>
          : G extends undefined
            ? IntersectShape6<A, B, C, D, E, F>
            : H extends undefined
              ? IntersectShape7<A, B, C, D, E, F, G>
              : I extends undefined
                ? IntersectShape8<A, B, C, D, E, F, G, H>
                : J extends undefined
                  ? IntersectShape9<A, B, C, D, E, F, G, H, I>
                  : IntersectShape10<A, B, C, D, E, F, G, H, I, J>;

  type IntersectShape2<A, B> =
    | (A & UndefinedDifference<A, B>)
    | (B & UndefinedDifference<B, A>);

  type IntersectShape3<A, B, C> =
    | (A & UndefinedDifference<A, B> & UndefinedDifference<A, C>)
    | (B & UndefinedDifference<B, A> & UndefinedDifference<B, C>)
    | (C & UndefinedDifference<C, A> & UndefinedDifference<C, B>);

  type IntersectShape4<A, B, C, D> =
    | (A &
        UndefinedDifference<A, B> &
        UndefinedDifference<A, C> &
        UndefinedDifference<A, D>)
    | (B &
        UndefinedDifference<B, A> &
        UndefinedDifference<B, C> &
        UndefinedDifference<B, D>)
    | (C &
        UndefinedDifference<C, A> &
        UndefinedDifference<C, B> &
        UndefinedDifference<C, D>)
    | (D &
        UndefinedDifference<D, A> &
        UndefinedDifference<D, B> &
        UndefinedDifference<D, C>);

  type IntersectShape5<A, B, C, D, E> =
    | (A &
        UndefinedDifference<A, B> &
        UndefinedDifference<A, C> &
        UndefinedDifference<A, D> &
        UndefinedDifference<A, E>)
    | (B &
        UndefinedDifference<B, A> &
        UndefinedDifference<B, C> &
        UndefinedDifference<B, D> &
        UndefinedDifference<B, E>)
    | (C &
        UndefinedDifference<C, A> &
        UndefinedDifference<C, B> &
        UndefinedDifference<C, D> &
        UndefinedDifference<C, E>)
    | (D &
        UndefinedDifference<D, A> &
        UndefinedDifference<D, B> &
        UndefinedDifference<D, C> &
        UndefinedDifference<D, E>)
    | (E &
        UndefinedDifference<E, A> &
        UndefinedDifference<E, B> &
        UndefinedDifference<E, C> &
        UndefinedDifference<E, D>);

  type IntersectShape6<A, B, C, D, E, F> =
    | (A &
        UndefinedDifference<A, B> &
        UndefinedDifference<A, C> &
        UndefinedDifference<A, D> &
        UndefinedDifference<A, E> &
        UndefinedDifference<A, F>)
    | (B &
        UndefinedDifference<B, A> &
        UndefinedDifference<B, C> &
        UndefinedDifference<B, D> &
        UndefinedDifference<B, E> &
        UndefinedDifference<B, F>)
    | (C &
        UndefinedDifference<C, A> &
        UndefinedDifference<C, B> &
        UndefinedDifference<C, D> &
        UndefinedDifference<C, E> &
        UndefinedDifference<C, F>)
    | (D &
        UndefinedDifference<D, A> &
        UndefinedDifference<D, B> &
        UndefinedDifference<D, C> &
        UndefinedDifference<D, E> &
        UndefinedDifference<D, F>)
    | (E &
        UndefinedDifference<E, A> &
        UndefinedDifference<E, B> &
        UndefinedDifference<E, C> &
        UndefinedDifference<E, D> &
        UndefinedDifference<E, F>)
    | (F &
        UndefinedDifference<F, A> &
        UndefinedDifference<F, B> &
        UndefinedDifference<F, C> &
        UndefinedDifference<F, D> &
        UndefinedDifference<F, E>);

  type IntersectShape7<A, B, C, D, E, F, G> =
    | (A &
        UndefinedDifference<A, B> &
        UndefinedDifference<A, C> &
        UndefinedDifference<A, D> &
        UndefinedDifference<A, E> &
        UndefinedDifference<A, F> &
        UndefinedDifference<A, G>)
    | (B &
        UndefinedDifference<B, A> &
        UndefinedDifference<B, C> &
        UndefinedDifference<B, D> &
        UndefinedDifference<B, E> &
        UndefinedDifference<B, F> &
        UndefinedDifference<B, G>)
    | (C &
        UndefinedDifference<C, A> &
        UndefinedDifference<C, B> &
        UndefinedDifference<C, D> &
        UndefinedDifference<C, E> &
        UndefinedDifference<C, F> &
        UndefinedDifference<C, G>)
    | (D &
        UndefinedDifference<D, A> &
        UndefinedDifference<D, B> &
        UndefinedDifference<D, C> &
        UndefinedDifference<D, E> &
        UndefinedDifference<D, F> &
        UndefinedDifference<D, G>)
    | (E &
        UndefinedDifference<E, A> &
        UndefinedDifference<E, B> &
        UndefinedDifference<E, C> &
        UndefinedDifference<E, D> &
        UndefinedDifference<E, F> &
        UndefinedDifference<E, G>)
    | (F &
        UndefinedDifference<F, A> &
        UndefinedDifference<F, B> &
        UndefinedDifference<F, C> &
        UndefinedDifference<F, D> &
        UndefinedDifference<F, E> &
        UndefinedDifference<F, G>)
    | (G &
        UndefinedDifference<G, A> &
        UndefinedDifference<G, B> &
        UndefinedDifference<G, C> &
        UndefinedDifference<G, D> &
        UndefinedDifference<G, E> &
        UndefinedDifference<G, F>);

  type IntersectShape8<A, B, C, D, E, F, G, H> =
    | (A &
        UndefinedDifference<A, B> &
        UndefinedDifference<A, C> &
        UndefinedDifference<A, D> &
        UndefinedDifference<A, E> &
        UndefinedDifference<A, F> &
        UndefinedDifference<A, G> &
        UndefinedDifference<A, H>)
    | (B &
        UndefinedDifference<B, A> &
        UndefinedDifference<B, C> &
        UndefinedDifference<B, D> &
        UndefinedDifference<B, E> &
        UndefinedDifference<B, F> &
        UndefinedDifference<B, G> &
        UndefinedDifference<B, H>)
    | (C &
        UndefinedDifference<C, A> &
        UndefinedDifference<C, B> &
        UndefinedDifference<C, D> &
        UndefinedDifference<C, E> &
        UndefinedDifference<C, F> &
        UndefinedDifference<C, G> &
        UndefinedDifference<C, H>)
    | (D &
        UndefinedDifference<D, A> &
        UndefinedDifference<D, B> &
        UndefinedDifference<D, C> &
        UndefinedDifference<D, E> &
        UndefinedDifference<D, F> &
        UndefinedDifference<D, G> &
        UndefinedDifference<D, H>)
    | (E &
        UndefinedDifference<E, A> &
        UndefinedDifference<E, B> &
        UndefinedDifference<E, C> &
        UndefinedDifference<E, D> &
        UndefinedDifference<E, F> &
        UndefinedDifference<E, G> &
        UndefinedDifference<E, H>)
    | (F &
        UndefinedDifference<F, A> &
        UndefinedDifference<F, B> &
        UndefinedDifference<F, C> &
        UndefinedDifference<F, D> &
        UndefinedDifference<F, E> &
        UndefinedDifference<F, G> &
        UndefinedDifference<F, H>)
    | (G &
        UndefinedDifference<G, A> &
        UndefinedDifference<G, B> &
        UndefinedDifference<G, C> &
        UndefinedDifference<G, D> &
        UndefinedDifference<G, E> &
        UndefinedDifference<G, F> &
        UndefinedDifference<G, H>)
    | (H &
        UndefinedDifference<H, A> &
        UndefinedDifference<H, B> &
        UndefinedDifference<H, C> &
        UndefinedDifference<H, D> &
        UndefinedDifference<H, E> &
        UndefinedDifference<H, F> &
        UndefinedDifference<H, G>);

  type IntersectShape9<A, B, C, D, E, F, G, H, I> =
    | (A &
        UndefinedDifference<A, B> &
        UndefinedDifference<A, C> &
        UndefinedDifference<A, D> &
        UndefinedDifference<A, E> &
        UndefinedDifference<A, F> &
        UndefinedDifference<A, G> &
        UndefinedDifference<A, H> &
        UndefinedDifference<A, I>)
    | (B &
        UndefinedDifference<B, A> &
        UndefinedDifference<B, C> &
        UndefinedDifference<B, D> &
        UndefinedDifference<B, E> &
        UndefinedDifference<B, F> &
        UndefinedDifference<B, G> &
        UndefinedDifference<B, H> &
        UndefinedDifference<B, I>)
    | (C &
        UndefinedDifference<C, A> &
        UndefinedDifference<C, B> &
        UndefinedDifference<C, D> &
        UndefinedDifference<C, E> &
        UndefinedDifference<C, F> &
        UndefinedDifference<C, G> &
        UndefinedDifference<C, H> &
        UndefinedDifference<C, I>)
    | (D &
        UndefinedDifference<D, A> &
        UndefinedDifference<D, B> &
        UndefinedDifference<D, C> &
        UndefinedDifference<D, E> &
        UndefinedDifference<D, F> &
        UndefinedDifference<D, G> &
        UndefinedDifference<D, H> &
        UndefinedDifference<D, I>)
    | (E &
        UndefinedDifference<E, A> &
        UndefinedDifference<E, B> &
        UndefinedDifference<E, C> &
        UndefinedDifference<E, D> &
        UndefinedDifference<E, F> &
        UndefinedDifference<E, G> &
        UndefinedDifference<E, H> &
        UndefinedDifference<E, I>)
    | (F &
        UndefinedDifference<F, A> &
        UndefinedDifference<F, B> &
        UndefinedDifference<F, C> &
        UndefinedDifference<F, D> &
        UndefinedDifference<F, E> &
        UndefinedDifference<F, G> &
        UndefinedDifference<F, H> &
        UndefinedDifference<F, I>)
    | (G &
        UndefinedDifference<G, A> &
        UndefinedDifference<G, B> &
        UndefinedDifference<G, C> &
        UndefinedDifference<G, D> &
        UndefinedDifference<G, E> &
        UndefinedDifference<G, F> &
        UndefinedDifference<G, H> &
        UndefinedDifference<G, I>)
    | (H &
        UndefinedDifference<H, A> &
        UndefinedDifference<H, B> &
        UndefinedDifference<H, C> &
        UndefinedDifference<H, D> &
        UndefinedDifference<H, E> &
        UndefinedDifference<H, F> &
        UndefinedDifference<H, G> &
        UndefinedDifference<H, I>)
    | (I &
        UndefinedDifference<I, A> &
        UndefinedDifference<I, B> &
        UndefinedDifference<I, C> &
        UndefinedDifference<I, D> &
        UndefinedDifference<I, E> &
        UndefinedDifference<I, F> &
        UndefinedDifference<I, G> &
        UndefinedDifference<I, H>);

  type IntersectShape10<A, B, C, D, E, F, G, H, I, J> =
    | (A &
        UndefinedDifference<A, B> &
        UndefinedDifference<A, C> &
        UndefinedDifference<A, D> &
        UndefinedDifference<A, E> &
        UndefinedDifference<A, F> &
        UndefinedDifference<A, G> &
        UndefinedDifference<A, H> &
        UndefinedDifference<A, I> &
        UndefinedDifference<A, J>)
    | (B &
        UndefinedDifference<B, A> &
        UndefinedDifference<B, C> &
        UndefinedDifference<B, D> &
        UndefinedDifference<B, E> &
        UndefinedDifference<B, F> &
        UndefinedDifference<B, G> &
        UndefinedDifference<B, H> &
        UndefinedDifference<B, I> &
        UndefinedDifference<B, J>)
    | (C &
        UndefinedDifference<C, A> &
        UndefinedDifference<C, B> &
        UndefinedDifference<C, D> &
        UndefinedDifference<C, E> &
        UndefinedDifference<C, F> &
        UndefinedDifference<C, G> &
        UndefinedDifference<C, H> &
        UndefinedDifference<C, I> &
        UndefinedDifference<C, J>)
    | (D &
        UndefinedDifference<D, A> &
        UndefinedDifference<D, B> &
        UndefinedDifference<D, C> &
        UndefinedDifference<D, E> &
        UndefinedDifference<D, F> &
        UndefinedDifference<D, G> &
        UndefinedDifference<D, H> &
        UndefinedDifference<D, I> &
        UndefinedDifference<D, J>)
    | (E &
        UndefinedDifference<E, A> &
        UndefinedDifference<E, B> &
        UndefinedDifference<E, C> &
        UndefinedDifference<E, D> &
        UndefinedDifference<E, F> &
        UndefinedDifference<E, G> &
        UndefinedDifference<E, H> &
        UndefinedDifference<E, I> &
        UndefinedDifference<E, J>)
    | (F &
        UndefinedDifference<F, A> &
        UndefinedDifference<F, B> &
        UndefinedDifference<F, C> &
        UndefinedDifference<F, D> &
        UndefinedDifference<F, E> &
        UndefinedDifference<F, G> &
        UndefinedDifference<F, H> &
        UndefinedDifference<F, I> &
        UndefinedDifference<F, J>)
    | (G &
        UndefinedDifference<G, A> &
        UndefinedDifference<G, B> &
        UndefinedDifference<G, C> &
        UndefinedDifference<G, D> &
        UndefinedDifference<G, E> &
        UndefinedDifference<G, F> &
        UndefinedDifference<G, H> &
        UndefinedDifference<G, I> &
        UndefinedDifference<G, J>)
    | (H &
        UndefinedDifference<H, A> &
        UndefinedDifference<H, B> &
        UndefinedDifference<H, C> &
        UndefinedDifference<H, D> &
        UndefinedDifference<H, E> &
        UndefinedDifference<H, F> &
        UndefinedDifference<H, G> &
        UndefinedDifference<H, I> &
        UndefinedDifference<H, J>)
    | (I &
        UndefinedDifference<I, A> &
        UndefinedDifference<I, B> &
        UndefinedDifference<I, C> &
        UndefinedDifference<I, D> &
        UndefinedDifference<I, E> &
        UndefinedDifference<I, F> &
        UndefinedDifference<I, G> &
        UndefinedDifference<I, H> &
        UndefinedDifference<I, J>)
    | (J &
        UndefinedDifference<J, A> &
        UndefinedDifference<J, B> &
        UndefinedDifference<J, C> &
        UndefinedDifference<J, D> &
        UndefinedDifference<J, E> &
        UndefinedDifference<J, F> &
        UndefinedDifference<J, G> &
        UndefinedDifference<J, H> &
        UndefinedDifference<J, I>);

  export type UndefinedDifference<BaseType, ApplyingType> = {
    [Key in Exclude<keyof ApplyingType, keyof BaseType>]?: undefined;
  };

  export type WholeOrPartial<Type> = Type | { [Key in keyof Type]?: Type[Key] };

  export type WholeOrEmpty<Type> = Type | { [Key in keyof Type]?: undefined };

  /**
   * Checks if exactOptionalPropertyTypes is enabled or not
   */
  export type ExactOptionalPropertyTypesEnabled = {
    test: undefined;
  } extends { test?: boolean }
    ? false
    : true;

  /**
   * Resolves never if the object has no keys.
   */
  export type NeverIfEmpty<Object> = keyof Object extends never
    ? never
    : Object;

  /**
   * Resolves unknown if the object has no keys.
   */
  export type UnknownIfEmpty<Object> = keyof Object extends never
    ? unknown
    : Object;
}
