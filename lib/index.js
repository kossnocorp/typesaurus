'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k]
          }
        })
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p)
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.docId = exports.DocId = void 0
__exportStar(require('./add'), exports)
__exportStar(require('./all'), exports)
__exportStar(require('./batch'), exports)
__exportStar(require('./collection'), exports)
__exportStar(require('./cursor'), exports)
__exportStar(require('./doc'), exports)
var docId_1 = require('./docId')
Object.defineProperty(exports, 'DocId', {
  enumerable: true,
  get: function () {
    return docId_1.DocId
  }
})
Object.defineProperty(exports, 'docId', {
  enumerable: true,
  get: function () {
    return docId_1.docId
  }
})
__exportStar(require('./field'), exports)
__exportStar(require('./get'), exports)
__exportStar(require('./getMany'), exports)
__exportStar(require('./group'), exports)
__exportStar(require('./limit'), exports)
__exportStar(require('./onAll'), exports)
__exportStar(require('./onGet'), exports)
__exportStar(require('./onGetMany'), exports)
__exportStar(require('./onQuery'), exports)
__exportStar(require('./order'), exports)
__exportStar(require('./query'), exports)
__exportStar(require('./ref'), exports)
__exportStar(require('./remove'), exports)
__exportStar(require('./set'), exports)
__exportStar(require('./subcollection'), exports)
__exportStar(require('./transaction'), exports)
__exportStar(require('./types'), exports)
__exportStar(require('./update'), exports)
__exportStar(require('./upset'), exports)
__exportStar(require('./value'), exports)
__exportStar(require('./where'), exports)
//# sourceMappingURL=index.js.map
