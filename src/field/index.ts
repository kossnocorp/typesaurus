import { UpdateValue } from '../value'

type Whole<Type, Key extends keyof Type> = Type[Key] extends
  | infer Value
  | undefined
  ? Value
  : never

type PartialValue<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Whole<Model, Key1>
> = Partial<Pick<Model, Key1>> extends Pick<Model, Key1>
  ? Partial<Model[Key1]> extends Model[Key1]
    ? Whole<Model, Key1>[Key2]
    : never
  : Whole<Model, Key1>[Key2]

/**
 * The field type. It contains path to the property and property value.
 */
export interface Field<_Model> {
  key: string | string[]
  value: any
}

export function field<Model, Key extends keyof Model>(
  key: Key | [Key],
  value: Model[Key] | UpdateValue<Model, Key>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Whole<Model, Key1>
>(
  key: [Key1, Key2],
  value: PartialValue<Model, Key1, Key2> | UpdateValue<Whole<Model, Key1>, Key2>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2]
>(
  key: [Key1, Key2, Key3],
  value: Model[Key1][Key2][Key3] | UpdateValue<Model[Key1][Key2], Key3>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3]
>(
  key: [Key1, Key2, Key3, Key4],
  value:
    | Model[Key1][Key2][Key3][Key4]
    | UpdateValue<Model[Key1][Key2][Key3], Key4>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4]
>(
  key: [Key1, Key2, Key3, Key4, Key5],
  value:
    | Model[Key1][Key2][Key3][Key4][Key5]
    | UpdateValue<Model[Key1][Key2][Key3][Key4], Key5>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5]
>(
  key: [Key1, Key2, Key3, Key4, Key5, Key6],
  value:
    | Model[Key1][Key2][Key3][Key4][Key5][Key6]
    | UpdateValue<Model[Key1][Key2][Key3][Key4][Key5], Key6>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6]
>(
  key: [Key1, Key2, Key3, Key4, Key5, Key6, Key7],
  value:
    | Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
    | UpdateValue<Model[Key1][Key2][Key3][Key4][Key5][Key6], Key7>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
>(
  key: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8],
  value:
    | Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
    | UpdateValue<Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7], Key8>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
>(
  key: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9],
  value:
    | Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
    | UpdateValue<Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8], Key9>
): Field<Model>

export function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7],
  Key9 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8],
  Key10 extends keyof Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
>(
  key: [Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9, Key10],
  value:
    | Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][Key10]
    | UpdateValue<
        Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9],
        Key10
      >
): Field<Model>

/**
 * Creates a field object. It's used to update nested maps.
 *
 * ```ts
 * import { field, update, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * update(users, '00sHm46UWKObv2W7XK9e', [
 *   field('name', 'Sasha Koss'),
 *   field(['address', 'city'], 'Dimitrovgrad')
 * ])
 * //=> Promise<void>
 * ```
 *
 * @param key - The field key or key path
 * @param value - The value
 * @returns The field object
 */
export function field<Model>(key: string | string[], value: any): Field<Model> {
  return { key, value }
}
