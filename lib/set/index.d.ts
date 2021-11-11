import type { Collection } from '../collection'
import type { Ref } from '../ref'
import type { OperationOptions, RuntimeEnvironment, WriteModel } from '../types'
export declare type SetOptions<
  Environment extends RuntimeEnvironment | undefined = undefined
> = OperationOptions<Environment>
/**
 * @param ref - the reference to the document to set
 * @param data - the document data
 */
export declare function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  ref: Ref<Model>,
  data: WriteModel<Model, Environment>,
  options?: SetOptions<Environment>
): Promise<void>
/**
 * @param collection - the collection to set document in
 * @param id - the id of the document to set
 * @param data - the document data
 */
export declare function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  collection: Collection<Model>,
  id: string,
  data: WriteModel<Model, Environment>,
  options?: SetOptions<Environment>
): Promise<void>
