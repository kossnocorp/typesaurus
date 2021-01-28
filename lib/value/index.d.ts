/**
 * Available value kinds.
 */
export declare type ValueKind = 'remove' | 'increment' | 'arrayUnion' | 'arrayRemove' | 'serverDate';
/**
 * The remove value type.
 */
export declare type ValueRemove = {
    __type__: 'value';
    kind: 'remove';
};
/**
 * The increment value type. It holds the increment value.
 */
export declare type ValueIncrement = {
    __type__: 'value';
    kind: 'increment';
    number: number;
};
/**
 * The array union value type. It holds the payload to union.
 */
export declare type ValueArrayUnion = {
    __type__: 'value';
    kind: 'arrayUnion';
    values: any[];
};
/**
 * The array remove value type. It holds the data to remove from the target array.
 */
export declare type ValueArrayRemove = {
    __type__: 'value';
    kind: 'arrayRemove';
    values: any[];
};
/**
 * The server date value type.
 */
export declare type ValueServerDate = {
    __type__: 'value';
    kind: 'serverDate';
};
/**
 * The value types that have no type constraints.
 */
export declare type AnyUpdateValue = ValueRemove;
/**
 * The value types to use for update operation.
 */
export declare type UpdateValue<T> = T extends number ? AnyUpdateValue | ValueIncrement : T extends Array<any> ? AnyUpdateValue | ValueArrayUnion | ValueArrayRemove : T extends Date ? ValueServerDate | AnyUpdateValue : AnyUpdateValue;
/**
 * The value types to use for add operation.
 */
export declare type AddValue<T> = T extends Date ? ValueServerDate : never;
/**
 * The value types to use for set operation.
 */
export declare type SetValue<T> = T extends Date ? ValueServerDate : never;
/**
 * The value types to use for upset operation.
 */
export declare type UpsetValue<T> = T extends number ? ValueIncrement : T extends Array<any> ? ValueArrayUnion | ValueArrayRemove : T extends Date ? ValueServerDate : never;
declare function value(kind: 'remove'): ValueRemove;
declare function value<T extends number>(kind: 'increment', number: number): ValueIncrement;
declare function value<T extends Array<any>>(kind: 'arrayUnion', payload: any[]): ValueArrayUnion;
declare function value<T extends Array<any>>(kind: 'arrayRemove', payload: any[]): ValueArrayRemove;
declare function value<T extends Date>(kind: 'serverDate'): ValueServerDate;
export { value };
