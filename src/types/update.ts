import type { TypesaurusUtils as Utils } from "./utils.js";
import type { TypesaurusCore as Core } from "./core.js";

export namespace TypesaurusUpdate {
  export interface CollectionFunction<Def extends Core.DocDef> {
    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: ArgData<Def, Props>,
      options?: Core.OperationOptions<Environment>,
    ): Promise<Core.Ref<Def>>;

    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: ArgGetterResolved<Core.DocModel<Def>, Def["WideModel"], Props>,
      options?: Core.OperationOptions<Environment>,
    ): Promise<Core.Ref<Def>>;

    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: ArgGetterUnresolved<Core.DocModel<Def>, Props>,
      options?: Core.OperationOptions<Environment>,
    ): undefined;

    build<
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      options?: Core.OperationOptions<Environment>,
    ): Builder<Def, Props>;
  }

  /**
   * The update doc function, used to define `update` method in the doc and ref
   * types.
   */
  export interface DocFunction<Def extends Core.DocDef> {
    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      data: ArgData<Def, Props>,
      options?: Core.OperationOptions<Environment>,
    ): Promise<Core.Ref<Def>>;

    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      data: ArgGetterResolved<Core.DocModel<Def>, Def["WideModel"], Props>,
      options?: Core.OperationOptions<Environment>,
    ): Promise<Core.Ref<Def>>;

    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      data: ArgGetterUnresolved<Core.DocModel<Def>, Props>,
      options?: Core.OperationOptions<Environment>,
    ): undefined;

    build<
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      options?: Core.OperationOptions<Environment>,
    ): Builder<Def, Props>;
  }

  /**
   * The update argument type. It can be update data or a function that returns
   * update data.
   */
  export type Arg<Def extends Core.DocDef, Props extends Core.DocProps> =
    | Core.WriteData<Core.UnionVariableModelType<Def["WideModel"]>, Props>
    | MinimalData<Def, Props>
    | Data<Core.DocModel<Def>, Props>
    | ArgGetter<Def, Props>;

  /**
   * The update argument data type. It excludes the getter function, so that
   * the type can be used in the update function signature. Keeping the getter
   * separate allows to infer the result without inferring the model shape.
   */
  export type ArgData<Def extends Core.DocDef, Props extends Core.DocProps> =
    | Core.WriteData<Core.UnionVariableModelType<Def["WideModel"]>, Props>
    | MinimalData<Def, Props>
    | Data<Core.DocModel<Def>, Props>;

  /**
   * Update data getter, accepts helper functions and returns the update data.
   */
  export type ArgGetter<Def extends Core.DocDef, Props extends Core.DocProps> =
    Core.DocModel<Def> extends infer Model extends Core.ModelObjectType
      ? ($: Helpers<Model, Props>) =>
          | Core.WriteData<Core.UnionVariableModelType<Def["WideModel"]>, Props>
          // TODO: MinimalData
          | Data<Model, Props>
          | UpdateField<Model>
          | Array<UpdateField<Model> | Utils.Falsy>
          | Utils.Falsy
      : never;

  /**
   * Update data getter, accepts helper functions and returns the update data.
   * The type assumes that the return type is resolved making it possible to
   * define separate update signatures.
   */
  export type ArgGetterResolved<
    Model extends Core.ModelObjectType,
    WideModel extends Core.ModelType,
    Props extends Core.DocProps,
  > = ($: Helpers<Model, Props>) =>
    | Core.WriteData<Core.UnionVariableModelType<WideModel>, Props>
    // TODO: MinimalData
    | Data<Model, Props>
    | UpdateField<Model>
    | Array<UpdateField<Model> | Utils.Falsy>;

  /**
   * Update data getter, accepts helper functions and returns the update data.
   * The type assumes that the return type is falsy making it possible to
   * define separate update signatures.
   */
  export type ArgGetterUnresolved<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > = ($: Helpers<Model, Props>) =>
    | Utils.Falsy
    // Falsy expects const "" but we also should consider any string, boolean or
    // number as falsy, so devs can do something like this:
    //   user.update($ => user.fullName && user.lastName(user.fullName.split(" ")[1]))
    | string
    | boolean
    | number;

  /**
   * The update field interface. It contains path to the property and property value.
   */
  export interface UpdateField<_Model> {
    key: string | string[];
    value: any;
  }

  /**
   * The update data type. It extends the model allowing to set specific values,
   * such as server dates, increment, etc. The data is also nullified allowing
   * to pass nulls instead of undefined.
   */
  export type Data<Model, Props extends Core.DocProps> = {
    [Key in keyof Model]?: Core.WriteField<Model, Key, Model[Key], Props>;
  };

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
                | Core.WriteData<Omit<A, keyof DocModel>, Props>
                | Core.WriteData<Omit<B, keyof DocModel>, Props>
                | Core.WriteData<Omit<C, keyof DocModel>, Props>
                | Core.WriteData<Omit<D, keyof DocModel>, Props>
                | Core.WriteData<Omit<E, keyof DocModel>, Props>
                | Core.WriteData<Omit<F, keyof DocModel>, Props>
                | Core.WriteData<Omit<G, keyof DocModel>, Props>
                | Core.WriteData<Omit<H, keyof DocModel>, Props>
                | Core.WriteData<Omit<I, keyof DocModel>, Props>
                | Core.WriteData<Omit<J, keyof DocModel>, Props>
              ) &
                Partial<Core.WriteData<DocModel, Props>>
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
                  | Core.WriteData<Omit<A, keyof DocModel>, Props>
                  | Core.WriteData<Omit<B, keyof DocModel>, Props>
                  | Core.WriteData<Omit<C, keyof DocModel>, Props>
                  | Core.WriteData<Omit<D, keyof DocModel>, Props>
                  | Core.WriteData<Omit<E, keyof DocModel>, Props>
                  | Core.WriteData<Omit<F, keyof DocModel>, Props>
                  | Core.WriteData<Omit<G, keyof DocModel>, Props>
                  | Core.WriteData<Omit<H, keyof DocModel>, Props>
                  | Core.WriteData<Omit<I, keyof DocModel>, Props>
                ) &
                  Partial<Core.WriteData<DocModel, Props>>
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
                    | Core.WriteData<Omit<A, keyof DocModel>, Props>
                    | Core.WriteData<Omit<B, keyof DocModel>, Props>
                    | Core.WriteData<Omit<C, keyof DocModel>, Props>
                    | Core.WriteData<Omit<D, keyof DocModel>, Props>
                    | Core.WriteData<Omit<E, keyof DocModel>, Props>
                    | Core.WriteData<Omit<F, keyof DocModel>, Props>
                    | Core.WriteData<Omit<G, keyof DocModel>, Props>
                    | Core.WriteData<Omit<H, keyof DocModel>, Props>
                  ) &
                    Partial<Core.WriteData<DocModel, Props>>
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
                      | Core.WriteData<Omit<A, keyof DocModel>, Props>
                      | Core.WriteData<Omit<B, keyof DocModel>, Props>
                      | Core.WriteData<Omit<C, keyof DocModel>, Props>
                      | Core.WriteData<Omit<D, keyof DocModel>, Props>
                      | Core.WriteData<Omit<E, keyof DocModel>, Props>
                      | Core.WriteData<Omit<F, keyof DocModel>, Props>
                      | Core.WriteData<Omit<G, keyof DocModel>, Props>
                    ) &
                      Partial<Core.WriteData<DocModel, Props>>
                  : Model extends [
                        infer A extends Core.ModelObjectType,
                        infer B extends Core.ModelObjectType,
                        infer C extends Core.ModelObjectType,
                        infer D extends Core.ModelObjectType,
                        infer E extends Core.ModelObjectType,
                        infer F extends Core.ModelObjectType,
                      ]
                    ? (
                        | Core.WriteData<Omit<A, keyof DocModel>, Props>
                        | Core.WriteData<Omit<B, keyof DocModel>, Props>
                        | Core.WriteData<Omit<C, keyof DocModel>, Props>
                        | Core.WriteData<Omit<D, keyof DocModel>, Props>
                        | Core.WriteData<Omit<E, keyof DocModel>, Props>
                        | Core.WriteData<Omit<F, keyof DocModel>, Props>
                      ) &
                        Partial<Core.WriteData<DocModel, Props>>
                    : Model extends [
                          infer A extends Core.ModelObjectType,
                          infer B extends Core.ModelObjectType,
                          infer C extends Core.ModelObjectType,
                          infer D extends Core.ModelObjectType,
                          infer E extends Core.ModelObjectType,
                        ]
                      ? (
                          | Core.WriteData<Omit<A, keyof DocModel>, Props>
                          | Core.WriteData<Omit<B, keyof DocModel>, Props>
                          | Core.WriteData<Omit<C, keyof DocModel>, Props>
                          | Core.WriteData<Omit<D, keyof DocModel>, Props>
                          | Core.WriteData<Omit<E, keyof DocModel>, Props>
                        ) &
                          Partial<Core.WriteData<DocModel, Props>>
                      : Model extends [
                            infer A extends Core.ModelObjectType,
                            infer B extends Core.ModelObjectType,
                            infer C extends Core.ModelObjectType,
                            infer D extends Core.ModelObjectType,
                          ]
                        ? (
                            | Core.WriteData<Omit<A, keyof DocModel>, Props>
                            | Core.WriteData<Omit<B, keyof DocModel>, Props>
                            | Core.WriteData<Omit<C, keyof DocModel>, Props>
                            | Core.WriteData<Omit<D, keyof DocModel>, Props>
                          ) &
                            Partial<Core.WriteData<DocModel, Props>>
                        : Model extends [
                              infer A extends Core.ModelObjectType,
                              infer B extends Core.ModelObjectType,
                              infer C extends Core.ModelObjectType,
                            ]
                          ? (
                              | Core.WriteData<Omit<A, keyof DocModel>, Props>
                              | Core.WriteData<Omit<B, keyof DocModel>, Props>
                              | Core.WriteData<Omit<C, keyof DocModel>, Props>
                            ) &
                              Partial<Core.WriteData<DocModel, Props>>
                          : Model extends [
                                infer A extends Core.ModelObjectType,
                                infer B extends Core.ModelObjectType,
                              ]
                            ? (
                                | Core.WriteData<Omit<A, keyof DocModel>, Props>
                                | Core.WriteData<Omit<B, keyof DocModel>, Props>
                              ) &
                                Partial<Core.WriteData<DocModel, Props>>
                            : Model extends [
                                  infer A extends Core.ModelObjectType,
                                ]
                              ? Core.WriteData<Omit<A, keyof DocModel>, Props> &
                                  Partial<Core.WriteData<DocModel, Props>>
                              : never
        : never
      : never;

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
