"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setApp = exports.injectTestingAdaptor = void 0;
const testing = __importStar(require("@firebase/testing"));
const adaptor_1 = require("../adaptor");
const utils_1 = require("../adaptor/utils");
let currentApp;
/**
 * Injects @firebase/testing adaptod instead of firebase-admin and set the given
 * app to be used for Firestore operations.
 *
 * ```ts
 * import * as testing from '@firebase/testing'
 * import { injectTestingAdaptor } from 'typesaurus/testing'
 *
 * // To initialize and inject an admin app (with exclusive access to the DB):
 * injectTestingAdaptor(testing.initializeAdminApp({ projectId: 'project-id' }))
 *
 * // To initialize and inject a client app (with given authentication details):
 * injectTestingAdaptor(
 *   testing.initializeTestApp({
 *     projectId: 'project-id',
 *     auth: { uid: 'user-id' }
 *   })
 * )
 * // Load security rules:
 * await testing.loadFirestoreRules({
 *   projectId: 'project-id',
 *   rules: '' // Security rules string
 * })
 * ```
 *
 * @param app - The testing app instance
 */
function injectTestingAdaptor(app) {
    setApp(app);
    adaptor_1.injectAdaptor(
    // TODO: Find a way to fix TS error:
    // @ts-ignore: @firebase/testing and firebase-admin use different types
    // for Firestore so I had to disable the error.
    () => {
        const firestore = currentApp.firestore();
        if (!('getAll' in firestore))
            return Object.assign(firestore, { getAll: utils_1.getAll });
        return firestore;
    }, {
        DocumentReference: testing.firestore.DocumentReference,
        Timestamp: testing.firestore.Timestamp,
        FieldPath: testing.firestore.FieldPath,
        FieldValue: testing.firestore.FieldValue
    });
}
exports.injectTestingAdaptor = injectTestingAdaptor;
/**
 * Sets the given app to be used for Firestore operations. Must be used after
 * calling `injectTestingAdaptor`.
 *
 * ```ts
 * import * as testing from '@firebase/testing'
 * import { injectTestingAdaptor, setApp } from 'typesaurus/testing'
 *
 * // Initialize as not authenticated:
 * injectTestingAdaptor(
 *   testing.initializeTestApp({
 *     projectId: 'project-id',
 *     auth: null
 *   })
 * )
 *
 * // Authenticate user with user-id as the id:
 * setApp(
 *   testing.initializeTestApp({
 *     projectId: 'project-id',
 *     auth: { user: 'user-id' }
 *   })
 * )
 * ```
 *
 * @param app - The testing app instance
 */
function setApp(app) {
    currentApp = app;
}
exports.setApp = setApp;
//# sourceMappingURL=index.js.map