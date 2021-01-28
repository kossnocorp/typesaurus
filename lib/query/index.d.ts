import { Collection } from '../collection';
import { Doc } from '../doc';
import { WhereQuery } from '../where';
import { OrderQuery } from '../order';
import { LimitQuery } from '../limit';
import { CollectionGroup } from '../group';
/**
 * The query type.
 */
export declare type Query<Model, Key extends keyof Model> = OrderQuery<Model, Key> | WhereQuery<Model> | LimitQuery;
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
export declare function query<Model>(collection: Collection<Model> | CollectionGroup<Model>, queries: Query<Model, keyof Model>[]): Promise<Doc<Model>[]>;
