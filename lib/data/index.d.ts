import { Adaptor } from '../adaptor';
/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param adaptor - the adaptor
 * @param data - the data to convert
 */
export declare function unwrapData(adaptor: Adaptor, data: any): any;
/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param consts - the adaptor constants
 * @param data - the data to convert
 */
export declare function wrapData(adaptor: Adaptor, data: unknown): unknown;
