/**
 * Creates a value object.
 *
 * ```ts
 * import { value, set, update, collection } from 'typesaurus'
 *
 * type User = {
 *   name: string,
 *   friends: number
 *   interests: string[]
 *   registrationDate: Date
 *   note?: string
 * }
 *
 * const users = collection<User>('users')
 *
 * (async () => {
 *   await set(users, '00sHm46UWKObv2W7XK9e', {
 *     name: 'Sasha',
 *     friends: 123,
 *     interests: ['snowboarding', 'surfboarding', 'running'],
 *     // Set server date value to the field
 *     registrationDate: value('serverDate')
 *   })
 *
 *   await update(users, '00sHm46UWKObv2W7XK9e', {
 *     // Add 2 to the value
 *     friends: value('increment', 2),
 *     // Remove 'running' from the interests
 *     interests: value('arrayRemove', ['running']),
 *     note: 'Demo'
 *   })
 *
 *   await update(users, '00sHm46UWKObv2W7XK9e', {
 *     // Remove the field
 *     note: value('remove')
 *     // Add values to the interests
 *     interests: value('arrayUnion', ['skateboarding', 'minecraft'])
 *   })
 * })()
 * ```
 *
 * @param kind - The value kind ('remove', 'increment', 'arrayUnion', 'arrayRemove' or 'serverDate')
 * @param payload - The payload if required by the kind
 */
function value(kind, payload) {
    switch (kind) {
        case 'remove':
            return { __type__: 'value', kind: 'remove' };
        case 'increment':
            return { __type__: 'value', kind: 'increment', number: payload };
        case 'arrayUnion':
            return { __type__: 'value', kind: 'arrayUnion', values: payload };
        case 'arrayRemove':
            return { __type__: 'value', kind: 'arrayRemove', values: payload };
        case 'serverDate':
            return { __type__: 'value', kind: 'serverDate' };
    }
}
export { value };
//# sourceMappingURL=index.js.map