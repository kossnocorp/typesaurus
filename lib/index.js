"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upset = exports.update = exports.set = exports.remove = exports.onQuery = exports.onGetMany = exports.onGet = exports.onAll = exports.getMany = exports.get = exports.field = exports.docId = exports.DocId = exports.all = exports.add = void 0;
var add_1 = require("./add");
Object.defineProperty(exports, "add", { enumerable: true, get: function () { return __importDefault(add_1).default; } });
var all_1 = require("./all");
Object.defineProperty(exports, "all", { enumerable: true, get: function () { return __importDefault(all_1).default; } });
__exportStar(require("./batch"), exports);
__exportStar(require("./collection"), exports);
__exportStar(require("./cursor"), exports);
__exportStar(require("./doc"), exports);
var docId_1 = require("./docId");
Object.defineProperty(exports, "DocId", { enumerable: true, get: function () { return docId_1.DocId; } });
Object.defineProperty(exports, "docId", { enumerable: true, get: function () { return docId_1.docId; } });
var field_1 = require("./field");
Object.defineProperty(exports, "field", { enumerable: true, get: function () { return __importDefault(field_1).default; } });
var get_1 = require("./get");
Object.defineProperty(exports, "get", { enumerable: true, get: function () { return __importDefault(get_1).default; } });
var getMany_1 = require("./getMany");
Object.defineProperty(exports, "getMany", { enumerable: true, get: function () { return __importDefault(getMany_1).default; } });
__exportStar(require("./group"), exports);
__exportStar(require("./limit"), exports);
var onAll_1 = require("./onAll");
Object.defineProperty(exports, "onAll", { enumerable: true, get: function () { return __importDefault(onAll_1).default; } });
var onGet_1 = require("./onGet");
Object.defineProperty(exports, "onGet", { enumerable: true, get: function () { return __importDefault(onGet_1).default; } });
var onGetMany_1 = require("./onGetMany");
Object.defineProperty(exports, "onGetMany", { enumerable: true, get: function () { return __importDefault(onGetMany_1).default; } });
var onQuery_1 = require("./onQuery");
Object.defineProperty(exports, "onQuery", { enumerable: true, get: function () { return __importDefault(onQuery_1).default; } });
__exportStar(require("./order"), exports);
__exportStar(require("./query"), exports);
__exportStar(require("./ref"), exports);
var remove_1 = require("./remove");
Object.defineProperty(exports, "remove", { enumerable: true, get: function () { return __importDefault(remove_1).default; } });
var set_1 = require("./set");
Object.defineProperty(exports, "set", { enumerable: true, get: function () { return __importDefault(set_1).default; } });
__exportStar(require("./subcollection"), exports);
__exportStar(require("./transaction"), exports);
var update_1 = require("./update");
Object.defineProperty(exports, "update", { enumerable: true, get: function () { return __importDefault(update_1).default; } });
var upset_1 = require("./upset");
Object.defineProperty(exports, "upset", { enumerable: true, get: function () { return __importDefault(upset_1).default; } });
__exportStar(require("./value"), exports);
__exportStar(require("./where"), exports);
//# sourceMappingURL=index.js.map