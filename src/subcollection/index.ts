import { Ref } from '../ref'
import { Collection, collection } from '../collection'

/**
 * The subcollection function type.
 */
export type Subcollection<Model, ParentModel> = (
  ref: Ref<ParentModel> | string
) => Collection<Model>

export type NestedSubcollection<
  Model,
  ParentModel,
  ParentIds extends Array<string>
> = (ref: Ref<ParentModel> | ParentIds) => Collection<Model>

function subcollection<Model, ParentModel>(
  name: string,
  parentCollection: Collection<ParentModel>
): Subcollection<Model, ParentModel>

function subcollection<Model, SubcollectionModel, SubcollectionParentModel>(
  name: string,
  parentSubcollection: Subcollection<
    SubcollectionModel,
    SubcollectionParentModel
  >
): NestedSubcollection<Model, SubcollectionModel, [string, string]>

function subcollection<
  Model,
  SubcollectionModel,
  SubcollectionParentModel,
  SubcollectionIds extends [string, string]
>(
  name: string,
  parentSubcollection: NestedSubcollection<
    SubcollectionModel,
    SubcollectionParentModel,
    SubcollectionIds
  >
): NestedSubcollection<Model, SubcollectionModel, [string, string, string]>

function subcollection<
  Model,
  SubcollectionModel,
  SubcollectionParentModel,
  SubcollectionIds extends [string, string, string]
>(
  name: string,
  parentSubcollection: NestedSubcollection<
    SubcollectionModel,
    SubcollectionParentModel,
    SubcollectionIds
  >
): NestedSubcollection<
  Model,
  SubcollectionModel,
  [string, string, string, string]
>

function subcollection<
  Model,
  SubcollectionModel,
  SubcollectionParentModel,
  SubcollectionIds extends [string, string, string, string]
>(
  name: string,
  parentSubcollection: NestedSubcollection<
    SubcollectionModel,
    SubcollectionParentModel,
    SubcollectionIds
  >
): NestedSubcollection<
  Model,
  SubcollectionModel,
  [string, string, string, string, string]
>

/**
 * Creates a subcollection function which accepts parent document reference
 * and returns the subcollection trasnformed into a collection object.
 *
 * ```ts
 * import { subcollection, collection, ref, add } from 'typesaurus'
 *
 * type User = { name: string }
 * type Order = { item: string }
 * const users = collection<User>('users')
 * const userOrders = subcollection<Order, User>('orders')
 *
 * const sashasOrders = userOrders('00sHm46UWKObv2W7XK9e')
 * //=> { __type__: 'collection', path: 'users/00sHm46UWKObv2W7XK9e/orders' }
 * // Also accepts reference:
 * userOrders(ref(users, '00sHm46UWKObv2W7XK9e')))
 *
 * add(sashasOrders, { item: 'Snowboard boots' })
 * ```
 *
 * @param name - The subcollection name
 * @param parentCollection - The parent collection
 * @returns Function which accepts parent document
 */
function subcollection<Model, ParentModel>(
  name: string,
  parentCollection:
    | Collection<ParentModel>
    | Subcollection<Model, ParentModel>
    | NestedSubcollection<Model, ParentModel, string[]>
): any {
  // TODO: Throw an exception when a collection has different name
  return (ref: Ref<ParentModel> | string | string[]) => {
    let id: string
    let coll: Collection<any>

    if (Array.isArray(ref)) {
      const ids = ref
      id = ids.pop() as string
      coll =
        typeof parentCollection === 'function'
          ? (parentCollection as NestedSubcollection<any, any, string[]>)(ids)
          : parentCollection
    } else if (typeof ref === 'string') {
      id = ref
      coll = parentCollection as Collection<any>
    } else {
      id = ref.id
      coll = ref.collection
    }

    return collection<Model>(`${coll.path}/${id}/${name}`)
  }
}

export { subcollection }
