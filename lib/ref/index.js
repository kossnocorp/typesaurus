"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathToRef = exports.refToFirestoreDocument = exports.getRefPath = exports.id = exports.ref = void 0;
const adaptor_1 = __importDefault(require("../adaptor"));
/**
 * Creates reference object to a document in given collection with given id.
 *
 * ```ts
 * import { ref, query, collection, where, Ref } from 'typesaurus'
 *
 * type User = { name: string }
 * type Order = { user: Ref<User>, item: string }
 * const users = collection<User>('users')
 * const orders = collection<User>('orders')
 *
 * query(orders, [where('user', '==', ref(users, '00sHm46UWKObv2W7XK9e')])
 *   .then(userOrders => {
 *     console.log(userOrders.length)
 *     //=> 42
 *   })
 * ```
 *
 * When id param is not passed it will be automatically generated:
 *
 * ```ts
 * import { ref, set, Ref } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const id = ref(users).id
 * set(users, id, {name: 'John Doe'})
 * ```
 *
 * @param collection - The collection to create refernce in
 * @param id=RANDOM_ID - The document id; generated when not passed
 * @returns The reference object
 */
function ref(collection, id) {
    return { __type__: 'ref', collection, id };
}
exports.ref = ref;
function id() {
    return __awaiter(this, void 0, void 0, function* () {
        const a = yield adaptor_1.default();
        return a.firestore.collection('nope').doc().id;
    });
}
exports.id = id;
/**
 * Generates Firestore path from a reference.
 *
 * @param ref - The reference to a document
 * @returns Firestore path
 */
function getRefPath(ref) {
    return [ref.collection.path].concat(ref.id).join('/');
}
exports.getRefPath = getRefPath;
/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
function refToFirestoreDocument({ firestore }, ref) {
    return firestore.doc(getRefPath(ref));
}
exports.refToFirestoreDocument = refToFirestoreDocument;
/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
function pathToRef(path) {
    const captures = path.match(/^(.+)\/(.+)$/);
    if (!captures)
        throw new Error(`Can't parse path ${path}`);
    const [, collectionPath, id] = captures;
    return {
        __type__: 'ref',
        collection: { __type__: 'collection', path: collectionPath },
        id
    };
}
exports.pathToRef = pathToRef;
//# sourceMappingURL=index.js.map