import { Adaptor } from '../adaptor'
import type { Collection } from '../collection'
import { AnyDoc, Doc } from '../doc'
import { Ref } from '../ref'
import type {
  DocOptions,
  OperationOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy
} from '../types'
export declare type GetOptions<
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
> = DocOptions<ServerTimestamps> & OperationOptions<Environment>
/**
 * @param ref - The reference to the document
 */
export declare function get<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model>,
  options?: GetOptions<Environment, ServerTimestamps>
): Promise<Doc<Model> | null>
/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
export declare function get<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  id: string,
  options?: GetOptions<Environment, ServerTimestamps>
): Promise<Doc<Model> | null>
export declare function getCommon<
  Model,
  Environment extends RuntimeEnvironment | undefined,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeIdOrOptions:
    | string
    | GetOptions<Environment, ServerTimestamps>
    | undefined,
  maybeOptions: GetOptions<Environment, ServerTimestamps> | undefined,
  {
    a,
    t
  }: {
    a: Adaptor
    t: FirebaseFirestore.Transaction | undefined
  }
): Promise<AnyDoc<Model, RuntimeEnvironment, boolean, ServerTimestamps> | null>
