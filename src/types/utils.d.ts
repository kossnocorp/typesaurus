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
   * Resolves true if all rest keys in the passed model are optional.
   */
  export type AllOptionalBut<Model, Key extends keyof Model> = Partial<
    Omit<Model, Key>
  > extends Omit<Model, Key>
    ? true
    : false

  export type RequiredPath1<Model, _Key1 extends keyof Model> = true

  export type RequiredPath2<
    Model,
    Key1 extends keyof Model,
    _Key2 extends keyof AllRequired<Model>[Key1]
  > = RequiredKey<Model, Key1> extends true ? true : false

  export type RequiredPath3<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    _Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2]
  > = RequiredPath2<Model, Key1, Key2> extends true
    ? RequiredKey<AllRequired<Model>[Key1], Key2> extends true
      ? true
      : false
    : false

  export type RequiredPath4<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    _Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3]
  > = RequiredPath3<Model, Key1, Key2, Key3> extends true
    ? RequiredKey<
        AllRequired<AllRequired<Model>[Key1]>[Key2],
        Key3
      > extends true
      ? true
      : false
    : false

  export type RequiredPath5<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2],
    Key4 extends keyof AllRequired<
      AllRequired<AllRequired<Model>[Key1]>[Key2]
    >[Key3],
    _Key5 extends keyof AllRequired<
      AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3]
    >[Key4]
  > = RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
    ? RequiredKey<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
        Key4
      > extends true
      ? true
      : false
    : false

  export type SafeOptionalPath1<
    Model,
    Key1 extends keyof Model
  > = AllOptionalBut<Model, Key1> extends true ? true : false

  export type SafeOptionalPath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1]
  > = SafeOptionalPath1<Model, Key1> extends true
    ? AllOptionalBut<AllRequired<Model>[Key1], Key2> extends true
      ? true
      : false
    : false

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

  export type SafePath1<Model, _Key1 extends keyof Model> = true

  export type SafePath2<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1]
  > = RequiredPath2<Model, Key1, Key2> extends true
    ? true
    : AllOptionalBut<AllRequired<Model>[Key1], Key2> extends true
    ? true
    : false

  export type SafePath3<
    Model,
    Key1 extends keyof Model,
    Key2 extends keyof AllRequired<Model>[Key1],
    Key3 extends keyof AllRequired<AllRequired<Model>[Key1]>[Key2]
  > = RequiredPath3<Model, Key1, Key2, Key3> extends true
    ? true
    : RequiredPath2<Model, Key1, Key2> extends true
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
  > = RequiredPath4<Model, Key1, Key2, Key3, Key4> extends true
    ? true
    : RequiredPath3<Model, Key1, Key2, Key3> extends true
    ? SafeOptionalPath1<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>[Key3],
        Key4
      >
    : RequiredPath2<Model, Key1, Key2> extends true
    ? SafeOptionalPath2<
        AllRequired<AllRequired<AllRequired<Model>[Key1]>[Key2]>,
        Key3,
        Key4
      >
    : SafeOptionalPath3<AllRequired<Model>[Key1], Key2, Key3, Key4>
}
