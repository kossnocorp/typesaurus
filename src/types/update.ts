import type { TypesaurusUtils as Utils } from "./utils.js";
import type { TypesaurusCore as Core } from "./core.js";

export namespace TypesaurusUpdate {
  export interface CollectionFunction<Def extends Core.DocDef> {
    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
      Arg extends TypesaurusUpdate.Arg<Def, Props>,
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
      Arg extends TypesaurusUpdate.Arg<Def, Props>,
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
    Arg extends TypesaurusUpdate.Arg<Def, Props>,
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
  export type Arg<Def extends Core.DocDef, Props extends Core.DocProps> =
    | Core.AssignData<Core.UnionVariableModelType<Def["WideModel"]>, Props>
    | MinimalData<Def, Props>
    | Data<Core.DocModel<Def>, Props>
    | Getter<Def, Props>;

  /**
   * The type resolves the minimal required data to update the variable
   * document. It includes unions each variable model type omitting the shared
   * properties. The shared properties are added back as optional.
   */
  export type MinimalData<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > = Def["Flags"]["Reduced"] extends true
    ? never
    : Def["WideModel"] extends infer Model
      ? Core.DocModel<Def> extends infer DocModel extends Core.ModelObjectType
        ? Model extends Core.ModelObjectType
          ? never
          : Model extends [
                infer A extends Core.ModelObjectType,
                infer B extends Core.ModelObjectType,
                infer C extends Core.ModelObjectType,
                infer D extends Core.ModelObjectType,
                infer E extends Core.ModelObjectType,
                infer F extends Core.ModelObjectType,
                infer G extends Core.ModelObjectType,
                infer H extends Core.ModelObjectType,
                infer I extends Core.ModelObjectType,
                infer J extends Core.ModelObjectType,
              ]
            ? (
                | Core.AssignData<Omit<A, keyof DocModel>, Props>
                | Core.AssignData<Omit<B, keyof DocModel>, Props>
                | Core.AssignData<Omit<C, keyof DocModel>, Props>
                | Core.AssignData<Omit<D, keyof DocModel>, Props>
                | Core.AssignData<Omit<E, keyof DocModel>, Props>
                | Core.AssignData<Omit<F, keyof DocModel>, Props>
                | Core.AssignData<Omit<G, keyof DocModel>, Props>
                | Core.AssignData<Omit<H, keyof DocModel>, Props>
                | Core.AssignData<Omit<I, keyof DocModel>, Props>
                | Core.AssignData<Omit<J, keyof DocModel>, Props>
              ) &
                Partial<Core.AssignData<DocModel, Props>>
            : Model extends [
                  infer A extends Core.ModelObjectType,
                  infer B extends Core.ModelObjectType,
                  infer C extends Core.ModelObjectType,
                  infer D extends Core.ModelObjectType,
                  infer E extends Core.ModelObjectType,
                  infer F extends Core.ModelObjectType,
                  infer G extends Core.ModelObjectType,
                  infer H extends Core.ModelObjectType,
                  infer I extends Core.ModelObjectType,
                ]
              ? (
                  | Core.AssignData<Omit<A, keyof DocModel>, Props>
                  | Core.AssignData<Omit<B, keyof DocModel>, Props>
                  | Core.AssignData<Omit<C, keyof DocModel>, Props>
                  | Core.AssignData<Omit<D, keyof DocModel>, Props>
                  | Core.AssignData<Omit<E, keyof DocModel>, Props>
                  | Core.AssignData<Omit<F, keyof DocModel>, Props>
                  | Core.AssignData<Omit<G, keyof DocModel>, Props>
                  | Core.AssignData<Omit<H, keyof DocModel>, Props>
                  | Core.AssignData<Omit<I, keyof DocModel>, Props>
                ) &
                  Partial<Core.AssignData<DocModel, Props>>
              : Model extends [
                    infer A extends Core.ModelObjectType,
                    infer B extends Core.ModelObjectType,
                    infer C extends Core.ModelObjectType,
                    infer D extends Core.ModelObjectType,
                    infer E extends Core.ModelObjectType,
                    infer F extends Core.ModelObjectType,
                    infer G extends Core.ModelObjectType,
                    infer H extends Core.ModelObjectType,
                  ]
                ? (
                    | Core.AssignData<Omit<A, keyof DocModel>, Props>
                    | Core.AssignData<Omit<B, keyof DocModel>, Props>
                    | Core.AssignData<Omit<C, keyof DocModel>, Props>
                    | Core.AssignData<Omit<D, keyof DocModel>, Props>
                    | Core.AssignData<Omit<E, keyof DocModel>, Props>
                    | Core.AssignData<Omit<F, keyof DocModel>, Props>
                    | Core.AssignData<Omit<G, keyof DocModel>, Props>
                    | Core.AssignData<Omit<H, keyof DocModel>, Props>
                  ) &
                    Partial<Core.AssignData<DocModel, Props>>
                : Model extends [
                      infer A extends Core.ModelObjectType,
                      infer B extends Core.ModelObjectType,
                      infer C extends Core.ModelObjectType,
                      infer D extends Core.ModelObjectType,
                      infer E extends Core.ModelObjectType,
                      infer F extends Core.ModelObjectType,
                      infer G extends Core.ModelObjectType,
                    ]
                  ? (
                      | Core.AssignData<Omit<A, keyof DocModel>, Props>
                      | Core.AssignData<Omit<B, keyof DocModel>, Props>
                      | Core.AssignData<Omit<C, keyof DocModel>, Props>
                      | Core.AssignData<Omit<D, keyof DocModel>, Props>
                      | Core.AssignData<Omit<E, keyof DocModel>, Props>
                      | Core.AssignData<Omit<F, keyof DocModel>, Props>
                      | Core.AssignData<Omit<G, keyof DocModel>, Props>
                    ) &
                      Partial<Core.AssignData<DocModel, Props>>
                  : Model extends [
                        infer A extends Core.ModelObjectType,
                        infer B extends Core.ModelObjectType,
                        infer C extends Core.ModelObjectType,
                        infer D extends Core.ModelObjectType,
                        infer E extends Core.ModelObjectType,
                        infer F extends Core.ModelObjectType,
                      ]
                    ? (
                        | Core.AssignData<Omit<A, keyof DocModel>, Props>
                        | Core.AssignData<Omit<B, keyof DocModel>, Props>
                        | Core.AssignData<Omit<C, keyof DocModel>, Props>
                        | Core.AssignData<Omit<D, keyof DocModel>, Props>
                        | Core.AssignData<Omit<E, keyof DocModel>, Props>
                        | Core.AssignData<Omit<F, keyof DocModel>, Props>
                      ) &
                        Partial<Core.AssignData<DocModel, Props>>
                    : Model extends [
                          infer A extends Core.ModelObjectType,
                          infer B extends Core.ModelObjectType,
                          infer C extends Core.ModelObjectType,
                          infer D extends Core.ModelObjectType,
                          infer E extends Core.ModelObjectType,
                        ]
                      ? (
                          | Core.AssignData<Omit<A, keyof DocModel>, Props>
                          | Core.AssignData<Omit<B, keyof DocModel>, Props>
                          | Core.AssignData<Omit<C, keyof DocModel>, Props>
                          | Core.AssignData<Omit<D, keyof DocModel>, Props>
                          | Core.AssignData<Omit<E, keyof DocModel>, Props>
                        ) &
                          Partial<Core.AssignData<DocModel, Props>>
                      : Model extends [
                            infer A extends Core.ModelObjectType,
                            infer B extends Core.ModelObjectType,
                            infer C extends Core.ModelObjectType,
                            infer D extends Core.ModelObjectType,
                          ]
                        ? (
                            | Core.AssignData<Omit<A, keyof DocModel>, Props>
                            | Core.AssignData<Omit<B, keyof DocModel>, Props>
                            | Core.AssignData<Omit<C, keyof DocModel>, Props>
                            | Core.AssignData<Omit<D, keyof DocModel>, Props>
                          ) &
                            Partial<Core.AssignData<DocModel, Props>>
                        : Model extends [
                              infer A extends Core.ModelObjectType,
                              infer B extends Core.ModelObjectType,
                              infer C extends Core.ModelObjectType,
                            ]
                          ? (
                              | Core.AssignData<Omit<A, keyof DocModel>, Props>
                              | Core.AssignData<Omit<B, keyof DocModel>, Props>
                              | Core.AssignData<Omit<C, keyof DocModel>, Props>
                            ) &
                              Partial<Core.AssignData<DocModel, Props>>
                          : Model extends [
                                infer A extends Core.ModelObjectType,
                                infer B extends Core.ModelObjectType,
                              ]
                            ? (
                                | Core.AssignData<
                                    Omit<A, keyof DocModel>,
                                    Props
                                  >
                                | Core.AssignData<
                                    Omit<B, keyof DocModel>,
                                    Props
                                  >
                              ) &
                                Partial<Core.AssignData<DocModel, Props>>
                            : Model extends [
                                  infer A extends Core.ModelObjectType,
                                ]
                              ? Core.AssignData<
                                  Omit<A, keyof DocModel>,
                                  Props
                                > &
                                  Partial<Core.AssignData<DocModel, Props>>
                              : never
        : never
      : never;

  /**
   * Update data getter, accepts helper functions and returns the update data.
   */
  export type Getter<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
  > = Core.DocModel<Def> extends infer Model extends Core.ModelObjectType
    ? (
        $: Helpers<Model, Props>,
      ) =>
        | Core.AssignData<Core.UnionVariableModelType<Def["WideModel"]>, Props>
        | Data<Model, Props>
        | UpdateField<Model>
        | Array<UpdateField<Model> | Utils.Falsy>
        | Utils.Falsy
    : never;

  /**
   * The update data type. It extends the model allowing to set specific values,
   * such as server dates, increment, etc. The data is also nullified allowing
   * to pass nulls instead of undefined.
   */
  export type Data<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > = {
    [Key in keyof Model]?: Core.WriteField<Model, Key, Model[Key], Props>;
  };

  /**
   * Update helpers which allow to set specific values, such as server dates,
   * increment, etc.
   */
  export interface Helpers<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > extends CommonHelpers<Model, Props, UpdateField<Model>> {}

  export interface Builder<Def extends Core.DocDef, Props extends Core.DocProps>
    extends CommonHelpers<Core.DocModel<Def>, Props, void> {
    run(): Promise<Core.Ref<Def>>;
  }

  export interface FieldHelpers<
    Props extends Core.DocProps,
    Parent,
    Key extends keyof Parent,
    SetResult,
  > {
    set(value: Core.WriteField<Parent, Key, Parent[Key], Props>): SetResult;
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
