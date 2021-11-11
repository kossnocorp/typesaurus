import { Adaptor } from '../adaptor';
import type { Collection } from '../collection';
import { AnyDoc } from '../doc';
import type { CollectionGroup } from '../group';
import type { DocOptions, OperationOptions, Query, RuntimeEnvironment, ServerTimestampsStrategy } from '../types';
export declare type QueryOptions<Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy> = DocOptions<ServerTimestamps> & OperationOptions<Environment>;
/**
 * Queries passed collection using query objects ({@link order}, {@link where}, {@link limit}).
 *
 * ```ts
 * import { query, limit, order, startAfter, collection } from 'typesaurus'
 *
 * type Contact = { name: string; year: number }
 * const contacts = collection<Contact>('contacts')
 *
 * query(contacts, [
 *   order('year', 'asc', [startAfter(2000)]),
 *   limit(2)
 * ]).then(bornAfter2000 => {
 *   console.log(bornAfter2000)
 *   //=> 420
 *   console.log(bornAfter2000[0].ref.id)
 *   //=> '00sHm46UWKObv2W7XK9e'
 *   console.log(bornAfter2000[0].data)
 *   //=> { name: 'Sasha' }
 * })
 * ```
 *
 * @param collection - The collection or collection group to query
 * @param queries - The query objects
 * @returns The promise to the query results
 */
export declare function query<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy>(collection: Collection<Model> | CollectionGroup<Model>, queries: Query<Model, keyof Model>[], options?: QueryOptions<Environment, ServerTimestamps>): Promise<AnyDoc<Model, Environment, boolean, ServerTimestamps>[]>;
export declare function queryCommon<Model, Environment extends RuntimeEnvironment | undefined, ServerTimestamps extends ServerTimestampsStrategy>(collection: Collection<Model> | CollectionGroup<Model>, queries: Query<Model, keyof Model>[], options: QueryOptions<Environment, ServerTimestamps> | undefined, { a, t }: {
    a: Adaptor;
    t: FirebaseFirestore.Transaction | undefined;
}): Promise<AnyDoc<Model, Environment, boolean, ServerTimestamps>[]>;
