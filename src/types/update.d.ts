import type { TypesaurusUtils } from '../utils/index'
import type { TypesaurusCore } from './core'

export namespace TypesaurusUpdate {
  export interface CollectionFunction<
    ModelPair extends TypesaurusCore.ModelIdPair
  > {
    <
      Environment extends
        | TypesaurusCore.RuntimeEnvironment
        | undefined = undefined
    >(
      id: ModelPair[1] /* Id */,
      data: TypesaurusUpdate.UpdateModelArg<
        ModelPair[0] /* Model */,
        Environment
      >,
      options?: TypesaurusCore.OperationOptions<Environment>
    ): Promise<TypesaurusCore.Ref<ModelPair>>

    build<
      Environment extends
        | TypesaurusCore.RuntimeEnvironment
        | undefined = undefined
    >(
      id: ModelPair[1] /* Id */,
      options?: TypesaurusCore.OperationOptions<Environment>
    ): Builder<ModelPair>
  }

  export interface DocFunction<ModelPair extends TypesaurusCore.ModelIdPair> {
    <
      Environment extends
        | TypesaurusCore.RuntimeEnvironment
        | undefined = undefined
    >(
      data: TypesaurusUpdate.UpdateModelArg<
        ModelPair[0] /* Model */,
        Environment
      >,
      options?: TypesaurusCore.OperationOptions<Environment>
    ): Promise<TypesaurusCore.Ref<ModelPair>>

    build<
      Environment extends
        | TypesaurusCore.RuntimeEnvironment
        | undefined = undefined
    >(
      options?: TypesaurusCore.OperationOptions<Environment>
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
    Model extends TypesaurusCore.ModelType,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > = UpdateModel<Model, Environment> | UpdateModelGetter<Model, Environment>

  export type UpdateModelGetter<
    Model extends TypesaurusCore.ModelType,
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
    Model extends TypesaurusCore.ModelType,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > = {
    [Key in keyof Model]?: TypesaurusCore.WriteValueNullable<
      Model[Key],
      TypesaurusCore.WriteValue<Model, Key, Environment>
    >
  }

  export interface FieldHelpers<
    Model extends TypesaurusCore.ModelType,
    Parent,
    Key extends keyof Parent,
    SetResult
  > {
    set(
      value: TypesaurusCore.WriteValueNullable<
        Parent[Key],
        TypesaurusCore.WriteValue<Parent, Key>
      >
    ): SetResult
  }

  export interface CommonHelpers<
    Model extends TypesaurusCore.ModelType,
    SetResult
  > extends TypesaurusCore.WriteHelpers<Model> {
    field<Key1 extends keyof Model>(
      key: Key1
    ): FieldHelpers<Model, Model, Key1, SetResult>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: TypesaurusUtils.SafePath2<Model, Key1, Key2> extends true
        ? Key2
        : never
    ): FieldHelpers<
      Model,
      TypesaurusUtils.AllRequired<Model>[Key1],
      Key2,
      SetResult
    >

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
    ): FieldHelpers<
      Model,
      TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2],
      Key3,
      SetResult
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
    ): FieldHelpers<
      Model,
      TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<
          TypesaurusUtils.AllRequired<Model>[Key1]
        >[Key2]
      >[Key3],
      Key4,
      SetResult
    >
  }

  export interface UpdateHelpers<Model extends TypesaurusCore.ModelType>
    extends CommonHelpers<Model, UpdateField<Model>> {}

  export interface Builder<ModelPair extends TypesaurusCore.ModelIdPair>
    extends CommonHelpers<ModelPair[0] /* Model */, void> {
    run(): Promise<TypesaurusCore.Ref<ModelPair>>
  }
}
