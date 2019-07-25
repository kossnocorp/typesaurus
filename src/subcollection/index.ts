import { Ref } from '../ref'
import { Collection, collection } from '../collection/index'

export type Subcollection<RefModel, CollectionModel> = (
  ref: Ref<RefModel>
) => Collection<CollectionModel>

function subcollection<CollectionModel, RefModel>(
  path: string,
  parentCollection: Collection<RefModel>
): Subcollection<RefModel, CollectionModel> {
  // TODO: Throw an exception when a collection has different name
  return ref =>
    collection<RefModel>(`${parentCollection.path}/${ref.id}/${path}`)
}

export { subcollection }
