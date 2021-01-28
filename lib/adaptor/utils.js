"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = void 0;
function getAll(...docs) {
    return Promise.all(docs.map(doc => doc.get()));
}
exports.getAll = getAll;
//# sourceMappingURL=utils.js.map