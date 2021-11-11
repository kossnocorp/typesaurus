'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.environmentError = exports.assertEnvironment = void 0
function assertEnvironment(adaptor, environment) {
  const error = environmentError(adaptor, environment)
  if (error) throw error
}
exports.assertEnvironment = assertEnvironment
function environmentError(adaptor, environment) {
  if (environment && adaptor.environment !== environment)
    return new Error(`Expected ${environment} environment`)
}
exports.environmentError = environmentError
//# sourceMappingURL=index.js.map
