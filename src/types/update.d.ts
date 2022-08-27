import type { TypesaurusUtils } from '../utils/index'
import type { TypesaurusCore } from './core'

export namespace TypesaurusUpdate {
  /**
   * The update field interface. It contains path to the property and property value.
   */
  export interface UpdateField<_Model> {
    key: string | string[]
    value: any
  }

  export type UpdateModelArg<
    Model,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > = UpdateModel<Model, Environment> | UpdateModelGetter<Model, Environment>

  export type UpdateModelGetter<
    Model,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
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
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > = {
    [Key in keyof Model]?: TypesaurusCore.WriteValueNullable<
      Model[Key],
      TypesaurusCore.WriteValue<Model, Key, Environment>
    >
  }

  export interface UpdateFieldHelpers<Model, Parent, Key extends keyof Parent> {
    set(
      value: TypesaurusCore.WriteValueNullable<
        Parent[Key],
        TypesaurusCore.WriteValue<Parent, Key>
      >
    ): UpdateField<Model>
  }

  export interface UpdateHelpers<Model>
    extends TypesaurusCore.WriteHelpers<Model> {
    field<Key1 extends keyof Model>(
      key: Key1
    ): UpdateFieldHelpers<Model, Model, Key1>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: TypesaurusUtils.SafePath2<Model, Key1, Key2> extends true
        ? Key2
        : never
    ): UpdateFieldHelpers<Model, TypesaurusUtils.AllRequired<Model>[Key1], Key2>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      key1: Key1,
      key2: TypesaurusUtils.SafePath2<Model, Key1, Key2> extends true
        ? Key2
        : never,
      key3: TypesaurusUtils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never
    ): UpdateFieldHelpers<
      Model,
      TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2],
      Key3
    >

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
      key2: TypesaurusUtils.SafePath2<Model, Key1, Key2> extends true
        ? Key2
        : never,
      key3: TypesaurusUtils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: TypesaurusUtils.SafePath4<
        Model,
        Key1,
        Key2,
        Key3,
        Key4
      > extends true
        ? Key4
        : never
    ): UpdateFieldHelpers<
      Model,
      TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<
          TypesaurusUtils.AllRequired<Model>[Key1]
        >[Key2]
      >[Key3],
      Key4
    >
  }
}
