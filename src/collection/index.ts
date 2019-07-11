export interface Collection<_Model, Nested = undefined> {
  __type__: 'collection'
  path: string
  nested?: Nested
}

function collection<Model, Nested = undefined>(
  path: string,
  nested?: Nested
): Collection<Model, Nested> {
  if (nested) {
    return { __type__: 'collection', path, nested }
  } else {
    return { __type__: 'collection', path }
  }
}

export { collection }
