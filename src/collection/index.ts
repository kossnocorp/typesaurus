export interface Collection<_Model> {
  __type__: 'collection'
  path: string
}

export function collection<Model>(path: string): Collection<Model> {
  return { __type__: 'collection', path }
}
