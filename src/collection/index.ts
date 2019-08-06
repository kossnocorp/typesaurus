export interface Collection<_Model> {
  __type__: 'collection'
  path: string
}

/**
 * Creates collection object.
 *
 * @param path - the collection path
 * @returns collection object
 *
 * @example
 * import { add, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 * // { __type__: 'collection', path: 'users' }
 *
 * add(users, { name: 'Sasha' })
 */
export function collection<Model>(path: string): Collection<Model> {
  return { __type__: 'collection', path }
}
