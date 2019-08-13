/**
 * The field type. It contains path to the property and property value.
 */
export interface Field<_Model> {
  key: string | string[]
  value: any
}

function field<Model, Key extends keyof Model>(
  key: Key | [Key],
  value: Model[Key]
): Field<Model>

function field<Model, Key1 extends keyof Model, Key2 extends keyof Model[Key1]>(
  key: [Key1, Key2],
  value: Model[Key1][Key2]
): Field<Model>

function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2]
>(key: [Key1, Key2, Key3], value: Model[Key1][Key2][Key3]): Field<Model>

function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3]
>(
  key: [Key1, Key2, Key3, Key4],
  value: Model[Key1][Key2][Key3][Key4]
): Field<Model>

function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4]
>(
  key: [Key1, Key2, Key3, Key4, Key5],
  value: Model[Key1][Key2][Key3][Key4][Key5]
): Field<Model>

function field<
  Model,
  Key1 extends keyof Model,
  Key2 extends keyof Model[Key1],
  Key3 extends keyof Model[Key1][Key2],
  Key4 extends keyof Model[Key1][Key2][Key3],
  Key5 extends keyof Model[Key1][Key2][Key3][Key4],
  Key6 extends keyof Model[Key1][Key2][Key3][Key4][Key5]
>(
  key: [Key1, Key2, Key3, Key4, Key5, Key6],
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6]
): Field<Model>

function field<
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
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
): Field<Model>

function field<
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
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]
): Field<Model>

function field<
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
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9]
): Field<Model>

function field<
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
  value: Model[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8][Key9][Key10]
): Field<Model>

/**
 * Creates a field object.
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
function field<Model>(key: string | string[], value: any): Field<Model> {
  return { key, value }
}

export default field
