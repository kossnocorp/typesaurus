import type { TypesaurusUtils as Utils } from "./utils.js";
import type { TypesaurusCore as Core } from "./core.js";
import { Nullify } from "../index.js";

export namespace TypesaurusUpdate {
  export interface CollectionFunction<Def extends Core.DocDef> {
    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
      Arg extends TypesaurusUpdate.Arg<Core.DocModel<Def>, Props>,
    >(
      id: Def["Id"],
      data: Arg,
      options?: Core.OperationOptions<Environment>,
    ): Result<Def, Props, Arg>;

    build<
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      options?: Core.OperationOptions<Environment>,
    ): Builder<Def, Props>;
  }

  export interface DocFunction<Def extends Core.DocDef> {
    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
      Arg extends TypesaurusUpdate.Arg<Core.DocModel<Def>, Props>,
    >(
      data: Arg,
      options?: Core.OperationOptions<Environment>,
    ): Result<Def, Props, Arg>;

    build<
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      options?: Core.OperationOptions<Environment>,
    ): Builder<Def, Props>;
  }

  /**
   * Update function (as collection, doc or ref method) result. It allows to
   * pass an object or function that returns an object or array of field
   * updates.
   *
   * The function also allows returning a falsy value, enabling conditionals
   * inside the function that wouldn't be otherwise possible. A condition before
   * the update wouldn't work as the check would be invalid inside the function.
   */
  export type Result<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
    Arg extends TypesaurusUpdate.Arg<Core.DocModel<Def>, Props>,
  > = Arg extends ($: Helpers<Core.DocModel<Def>, Props>) => infer Result
    ? Result extends Utils.Falsy
      ? undefined
      : Promise<Core.Ref<Def>>
    : Promise<Core.Ref<Def>>;

  /**
   * The update field interface. It contains path to the property and property value.
   */
  export interface UpdateField<_Model> {
    key: string | string[];
    value: any;
  }

  /**
   * The update argument type. It can be update data or a function that returns
   * update data.
   */
  export type Arg<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > = Data<Model, Props> | Getter<Model, Props>;

  /**
   * Update data getter, accepts helper functions and returns the update data.
   */
  export type Getter<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > = (
    $: Helpers<Model, Props>,
  ) =>
    | Data<Model, Props>
    | UpdateField<Model>
    | Array<UpdateField<Model> | Utils.Falsy>
    | Utils.Falsy;

  /**
   * The update data type. It extends the model allowing to set specific values,
   * such as server dates, increment, etc. The data is also nullified allowing
   * to pass nulls instead of undefined.
   */
  export type Data<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > = Nullify<{
    [Key in keyof Model]?: Core.WriteField<Model, Key, Model[Key], Props>;
  }>;

  /**
   * Update helpers which allow to set specific values, such as server dates,
   * increment, etc.
   */
  export interface Helpers<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > extends CommonHelpers<Nullify<Model>, Props, UpdateField<Model>> {}

  export interface Builder<Def extends Core.DocDef, Props extends Core.DocProps>
    extends CommonHelpers<
      Core.Nullify<
        Def["Flags"]["Reduced"] extends true
          ? Core.IntersectVariableModelType<Def["Model"]>
          : Core.SharedVariableModelType<Def["WideModel"]>
      >,
      Props,
      void
    > {
    run(): Promise<Core.Ref<Def>>;
  }

  export interface FieldHelpers<
    Props extends Core.DocProps,
    Parent,
    Key extends keyof Parent,
    SetResult,
  > {
    set(
      value: Nullify<Core.WriteField<Parent, Key, Parent[Key], Props>>,
    ): SetResult;
  }

  export interface CommonHelpers<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
    SetResult,
  > extends Core.WriteHelpers<Model> {
    /**
     * Field selector, allows updating a specific field.
     */
    field<Key1 extends keyof Model>(
      key: Key1,
    ): FieldHelpers<Props, Model, Key1, SetResult>;

    /**
     * Field selector, allows updating a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
    ): FieldHelpers<Props, Utils.AllRequired<Model>[Key1], Key2, SetResult>;

    /**
     * Field selector, allows updating a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
    ): FieldHelpers<
      Props,
      Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2],
      Key3,
      SetResult
    >;

    /**
     * Field selector, allows updating a specific field.
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
    >(
      key1: Key1,
      key2: Utils.SafePath2<Model, Key1, Key2> extends true ? Key2 : never,
      key3: Utils.SafePath3<Model, Key1, Key2, Key3> extends true
        ? Key3
        : never,
      key4: Utils.SafePath4<Model, Key1, Key2, Key3, Key4> extends true
        ? Key4
        : never,
    ): FieldHelpers<
      Props,
      Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key4,
      SetResult
    >;

    /**
     * Field selector, allows updating a specific field.
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
    ): FieldHelpers<
      Props,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key5,
      SetResult
    >;

    /**
     * Field selector, allows updating a specific field.
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
    ): FieldHelpers<
      Props,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key6,
      SetResult
    >;

    /**
     * Field selector, allows updating a specific field.
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
    ): FieldHelpers<
      Props,
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
    >;

    /**
     * Field selector, allows updating a specific field.
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
    ): FieldHelpers<
      Props,
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
    >;

    /**
     * Field selector, allows updating a specific field.
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
    ): FieldHelpers<
      Props,
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
    >;

    /**
     * Field selector, allows updating a specific field.
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
      >[Key9],
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
        : never,
    ): FieldHelpers<
      Props,
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
      >[Key9],
      Key10,
      SetResult
    >;
  }
}
