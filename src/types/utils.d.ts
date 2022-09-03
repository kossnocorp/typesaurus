export namespace TypesaurusUtils {
  export type ComposePath<
    BasePath extends string | undefined,
    Path extends string
  > = BasePath extends undefined ? Path : `${BasePath}/${Path}`

  /**
   * Resolves union keys.
   */
  export type UnionKeys<Type> = Type extends Type ? keyof Type : never

  /**
   * Returns a type with all fields required and all values exclude undefined.
   * It allows to extract key paths from nested objects with optional keys
   * and values.
   */
  export type AllRequired<Model> = {
    [Key in keyof Required<Model>]-?: Exclude<Required<Model>[Key], undefined>
  }

  /**
   * Resolves true if the passed key is a required field of the passed model.
   */
  export type RequiredKey<Model, Key extends keyof Model> = Partial<
    Pick<Model, Key>
  > extends Pick<Model, Key>
    ? false
    : true

  /**
   * Resolves true if all sibling fields in the passed model are optional.
   */
  export type AllOptionalBut<Model, Key extends keyof Model> = Partial<
    Omit<Model, Key>
  > extends Omit<Model, Key>
    ? true
    : false

  /**
   * Resolves true if the passed path to a field within a nested object
   * is required on every nesting level. It helps to prevent updates from
   * causing data inconsistency.
   *
   * This is the 1-lever deep version, see RequiredPathN for more levels.
   *
   * See {@link RequiredPath2} for the internal implementation details.
   */
  export type RequiredPath1<Model, Key1 extends keyof Model> = RequiredKey<
    Model,
    Key1
  > extends true
    ? true
    : false

  /**
   * See {@link RequiredPath1} for the documentation.
   *
   * This is the 2-level deep version of the type.
   */
  export type RequiredPath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1]
  > = RequiredPath1<Model, Key1> extends true // Check if the path is safe up to this level
    ? RequiredKey<AllRequired<Model>[Key1], Key2> extends true // Check if the given field is required
      ? true
      : false
    : false

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
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2]
  > = RequiredPath2<Model, Key1, Key2> extends true
    ? RequiredKey<
        AllRequired<AllRequired<Model>[Key1]>[Key2],
        Key3
      > extends true
      ? true
      : false
    : false

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
    >[Key3]
  > = RequiredPath3<Model, Key1, Key2, Key3> extends true
    ? RequiredKey<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
        Key4
      > extends true
      ? true
      : false
    : false

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
    >[Key4]
  > = RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
    ? RequiredKey<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4],
        Key5
      > extends true
      ? true
      : false
    : false

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
    >[Key5]
  > = RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
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
    : false

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
    >[Key6]
  > = RequiredPath6<Model, Key1, Key2, Key3, Key4, Key5, Key6> extends true
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
    : false

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
    >[Key7]
  > = RequiredPath7<
    Model,
    Key1,
    Key2,
    Key3,
    Key4,
    Key5,
    Key6,
    Key7
  > extends true
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
    : false

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
    >[Key8]
  > = RequiredPath8<
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
                  AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8],
        Key9
      > extends true
      ? true
      : false
    : false

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
    >[Key9]
  > = RequiredPath9<
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
    : false

  /**
   * Resolves true if the passed optional path to a field within a nested object
   * is safe to update, meaning there are no required sibling fields on every
   * nesting level. It helps to prevent updates from causing data inconsistency.
   *
   * This is the 1-lever deep version, see SafeOptionalPathN for more levels.
   *
   * See {@link SafeOptionalPath2} for the internal implementation details.
   */
  export type SafeOptionalPath1<
    Model,
    Key1 extends keyof Model
  > = AllOptionalBut<Model, Key1> extends true ? true : false

  /**
   * See {@link SafeOptionalPath1} for the documentation.
   *
   * This is the 2-level deep version of the type.
   */
  export type SafeOptionalPath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1]
  > = SafeOptionalPath1<Model, Key1> extends true // Check if the path is safe up to this level
    ? AllOptionalBut<AllRequired<Model>[Key1], Key2> extends true // Checks if there are no required sibling fields
      ? true
      : false
    : false

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
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2]
  > = SafeOptionalPath2<Model, Key1, Key2> extends true
    ? AllOptionalBut<
        AllRequired<AllRequired<Model>[Key1]>[Key2],
        Key3
      > extends true
      ? true
      : false
    : false

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
    >[Key3]
  > = SafeOptionalPath3<Model, Key1, Key2, Key3> extends true
    ? AllOptionalBut<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
        Key4
      > extends true
      ? true
      : false
    : false

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
    >[Key4]
  > = SafeOptionalPath4<Model, Key1, Key2, Key3, Key4> extends true
    ? AllOptionalBut<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4],
        Key5
      > extends true
      ? true
      : false
    : false

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
    >[Key5]
  > = SafeOptionalPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
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
    : false

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
    >[Key6]
  > = SafeOptionalPath6<Model, Key1, Key2, Key3, Key4, Key5, Key6> extends true
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
    : false

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
    >[Key7]
  > = SafeOptionalPath7<
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
    : false

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
    >[Key8]
  > = SafeOptionalPath8<
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
                  AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8],
        Key9
      > extends true
      ? true
      : false
    : false

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
    >[Key9]
  > = SafeOptionalPath9<
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
    : false

  export type SafePath1<Model, _Key1 extends keyof Model> = true

  export type SafePath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1]
  > = RequiredPath1<Model, Key1> extends true
    ? true
    : AllOptionalBut<AllRequired<Model>[Key1], Key2> extends true
    ? true
    : false

  export type SafePath3<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2]
  > = RequiredPath2<Model, Key1, Key2> extends true
    ? true
    : RequiredPath1<Model, Key1> extends true
    ? SafeOptionalPath1<AllRequired<AllRequired<Model>[Key1]>[Key2], Key3>
    : SafeOptionalPath2<AllRequired<Model>[Key1], Key2, Key3>

  export type SafePath4<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3]
  > = RequiredPath3<Model, Key1, Key2, Key3> extends true
    ? true
    : RequiredPath2<Model, Key1, Key2> extends true
    ? SafeOptionalPath1<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
        Key4
      >
    : RequiredPath1<Model, Key1> extends true
    ? SafeOptionalPath2<AllRequired<AllRequired<Model>[Key1]>[Key2], Key3, Key4>
    : SafeOptionalPath3<AllRequired<Model>[Key1], Key2, Key3, Key4>

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
    >[Key4]
  > = RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
    ? true
    : RequiredPath3<Model, Key1, Key2, Key3> extends true
    ? SafeOptionalPath1<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4],
        Key5
      >
    : RequiredPath2<Model, Key1, Key2> extends true
    ? SafeOptionalPath2<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
        Key4,
        Key5
      >
    : RequiredPath1<Model, Key1> extends true
    ? SafeOptionalPath3<
        AllRequired<AllRequired<Model>[Key1]>[Key2],
        Key3,
        Key4,
        Key5
      >
    : SafeOptionalPath4<AllRequired<Model>[Key1], Key2, Key3, Key4, Key5>

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
    >[Key5]
  > = RequiredPath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
    ? true
    : RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
    ? SafeOptionalPath1<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4],
        Key5
      >
    : RequiredPath3<Model, Key1, Key2, Key3> extends true
    ? SafeOptionalPath2<
        AllRequired<
          AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
        >[Key4],
        Key5,
        Key6
      >
    : RequiredPath2<Model, Key1, Key2> extends true
    ? SafeOptionalPath3<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
        Key4,
        Key5,
        Key6
      >
    : RequiredPath1<Model, Key1> extends true
    ? SafeOptionalPath4<
        AllRequired<AllRequired<Model>[Key1]>[Key2],
        Key3,
        Key4,
        Key5,
        Key6
      >
    : SafeOptionalPath5<AllRequired<Model>[Key1], Key2, Key3, Key4, Key5, Key6>
}
