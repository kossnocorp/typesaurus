"use strict";
/**
 * Lazy browser Firestore adaptor.
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectAdaptor = void 0;
const utils_1 = require("../utils");
function adaptor() {
    return __awaiter(this, void 0, void 0, function* () {
        const { default: firebase } = yield Promise.resolve().then(() => __importStar(require('firebase/app')));
        yield Promise.resolve().then(() => __importStar(require('firebase/firestore')));
        const firestore = firebase.firestore();
        // At the moment, the browser's Firestore adaptor doesn't support getAll.
        // Get rid of the fallback when the issue is closed:
        // https://github.com/firebase/firebase-js-sdk/issues/1176
        if (!('getAll' in firestore))
            Object.assign(firestore, { getAll: utils_1.getAll });
        return {
            firestore,
            consts: {
                DocumentReference: firebase.firestore.DocumentReference,
                Timestamp: firebase.firestore.Timestamp,
                GeoPoint: firebase.firestore.GeoPoint,
                FieldPath: firebase.firestore.FieldPath,
                FieldValue: firebase.firestore.FieldValue
            },
            getDocMeta: (snapshot) => ({
                fromCache: snapshot.metadata.fromCache,
                hasPendingWrites: snapshot.metadata.hasPendingWrites
            })
        };
    });
}
exports.default = adaptor;
function injectAdaptor() {
    throw new Error('Injecting adaptor is not supported in the browser environment');
}
exports.injectAdaptor = injectAdaptor;
//# sourceMappingURL=lazy.js.map