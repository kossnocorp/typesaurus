import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusCore as Core } from './core'

export namespace TypesaurusUpdate {
  export interface CollectionFunction<ModelPair extends Core.ModelIdPair> {
    <Environment extends Core.RuntimeEnvironment | undefined = undefined>(
      id: ModelPair[1] /* Id */,
      data: TypesaurusUpdate.UpdateModelArg<
        ModelPair[0] /* Model */,
        Environment
      >,
      options?: Core.OperationOptions<Environment>
    ): Promise<Core.Ref<ModelPair>>

    build<Environment extends Core.RuntimeEnvironment | undefined = undefined>(
      id: ModelPair[1] /* Id */,
      options?: Core.OperationOptions<Environment>
    ): Builder<ModelPair>
  }

  export interface DocFunction<ModelPair extends Core.ModelIdPair> {
    <Environment extends Core.RuntimeEnvironment | undefined = undefined>(
      data: TypesaurusUpdate.UpdateModelArg<
        ModelPair[0] /* Model */,
        Environment
      >,
      options?: Core.OperationOptions<Environment>
    ): Promise<Core.Ref<ModelPair>>

    build<Environment extends Core.RuntimeEnvironment | undefined = undefined>(
      options?: Core.OperationOptions<Environment>
    ): Builder<ModelPair>
  }

  /**
   * The update field interface. It contains path to the property and property value.
   */
  export interface UpdateField<_Model> {
    key: string | string[]
    value: any
  }

  export type UpdateModelArg<
    Model extends Core.ModelType,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = UpdateModel<Model, Environment> | UpdateModelGetter<Model, Environment>

  export type UpdateModelGetter<
    Model extends Core.ModelType,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
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
    Model extends Core.ModelType,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = {
    [Key in keyof Model]?: Core.WriteValueNullable<
      Model[Key],
      Core.WriteValue<Model, Key, Environment>
    >
  }

  export interface FieldHelpers<
    Model extends Core.ModelType,
    Parent,
    Key extends keyof Parent,
    SetResult
  > {
    set(
      value: Core.WriteValueNullable<Parent[Key], Core.WriteValue<Parent, Key>>
    ): SetResult
  }

  export interface CommonHelpers<Model extends Core.ModelType, SetResult>
    extends Core.WriteHelpers<Model> {
    /**
     * Field selector, allows to update a specific field.
     */
    field<Key1 extends keyof Model>(
      key: Key1
    ): FieldHelpers<Model, Model, Key1, SetResult>

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never
    ): FieldHelpers<Model, Utils.AllRequired<Model>[Key1], Key2, SetResult>

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true ? Key3 : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2],
      Key3,
      SetResult
    >

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key4,
      SetResult
    >

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never,
      key5: Utils.SafePath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
        ? Key5
        : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key5,
      SetResult
    >

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never,
      key5: Utils.SafePath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
        ? Key5
        : never,
      key6: Utils.SafePath6<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6
      > extends true
        ? Key6
        : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key6,
      SetResult
    >

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never,
      key5: Utils.SafePath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
        ? Key5
        : never,
      key6: Utils.SafePath6<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6
      > extends true
        ? Key6
        : never,
      key7: Utils.SafePath7<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7
      > extends true
        ? Key7
        : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key7,
      SetResult
    >

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key8 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never,
      key5: Utils.SafePath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
        ? Key5
        : never,
      key6: Utils.SafePath6<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6
      > extends true
        ? Key6
        : never,
      key7: Utils.SafePath7<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7
      > extends true
        ? Key7
        : never,
      key8: Utils.SafePath8<
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
        ? Key8
        : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7],
      Key8,
      SetResult
    >

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key8 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7],
      Key9 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never,
      key5: Utils.SafePath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
        ? Key5
        : never,
      key6: Utils.SafePath6<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6
      > extends true
        ? Key6
        : never,
      key7: Utils.SafePath7<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7
      > extends true
        ? Key7
        : never,
      key8: Utils.SafePath8<
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
        ? Key8
        : never,
      key9: Utils.SafePath9<
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
        ? Key9
        : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8],
      Key9,
      SetResult
    >

    /**
     * Field selector, allows to update a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key8 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7],
      Key9 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8],
      Key10 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8]
      >[Key9]
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never,
      key5: Utils.SafePath5<Model, Key1, Key2, Key3, Key4, Key5> extends true
        ? Key5
        : never,
      key6: Utils.SafePath6<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6
      > extends true
        ? Key6
        : never,
      key7: Utils.SafePath7<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7
      > extends true
        ? Key7
        : never,
      key8: Utils.SafePath8<
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
        ? Key8
        : never,
      key9: Utils.SafePath9<
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
        ? Key9
        : never,
      key10: Utils.SafePath10<
        Model,
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
      > extends true
        ? Key10
        : never
    ): FieldHelpers<
      Model,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8]
      >,
      Key10,
      SetResult
    >
  }

  export interface UpdateHelpers<Model extends Core.ModelType>
    extends CommonHelpers<Model, UpdateField<Model>> {}

  export interface Builder<ModelPair extends Core.ModelIdPair>
    extends CommonHelpers<ModelPair[0] /* Model */, void> {
    run(): Promise<Core.Ref<ModelPair>>
  }
}
