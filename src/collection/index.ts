export interface Collection<_Model> {
  __type__: 'collection'
  path: string
}

function collection<Model>(path: string): Collection<Model> {
  return { __type__: 'collection', path }
}

export { collection }
