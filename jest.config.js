/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  roots: ['<rootDir>/src/'],
  testRegex: ['tests\\.ts$', 'tests/.+\\.ts$'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupAdmin.ts'],
  transform: {
    '\\.(mjs|js|ts)$': 'babel-jest'
  }
}
