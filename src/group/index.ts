import { Collection } from '../collection'
import { Subcollection } from '../subcollection'

export interface CollectionGroup<_Model> {
  __type__: 'collectionGroup'
  path: string
}

type CollectionEntity<Model> = Collection<Model> | Subcollection<any, Model>

function group<A>(
  path: string,
  collections: [CollectionEntity<A>]
): CollectionGroup<A>

function group<A, B>(
  path: string,
  collections: [CollectionEntity<A>, CollectionEntity<B>]
): CollectionGroup<A | B>

function group<A, B, C>(
  path: string,
  collections: [CollectionEntity<A>, CollectionEntity<B>, CollectionEntity<C>]
): CollectionGroup<A | B | C>

function group(
  path: string,
  _collections: CollectionEntity<any>[]
): CollectionGroup<unknown> {
  return {
    __type__: 'collectionGroup',
    path
  }
}

export { group }
