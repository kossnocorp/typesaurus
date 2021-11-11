import { Collection } from '../collection';
import { Subcollection, NestedSubcollection } from '../subcollection';
/**
 * The collection group type. It contains the collection name.
 */
export interface CollectionGroup<_Model> {
    __type__: 'collectionGroup';
    path: string;
}
declare type CollectionEntity<Model> = Collection<Model> | Subcollection<Model, any> | NestedSubcollection<Model, any, any>;
declare function group<A>(path: string, collections: [CollectionEntity<A>]): CollectionGroup<A>;
declare function group<A, B>(path: string, collections: [CollectionEntity<A>, CollectionEntity<B>]): CollectionGroup<A | B>;
declare function group<A, B, C>(path: string, collections: [CollectionEntity<A>, CollectionEntity<B>, CollectionEntity<C>]): CollectionGroup<A | B | C>;
export { group };
