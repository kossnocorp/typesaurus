/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  roots: ['<rootDir>/src/'],
  testRegex: ['tests\\.ts$', 'tests/.+\\.ts$'],
  // setupFiles: [
  //   process.env.FIRESTORE_EMULATOR_HOST
  //     ? '<rootDir>/test/setupJestLocal.ts'
  //     : '<rootDir>/test/setupJestSystem.ts'
  // ],
  setupFilesAfterEnv: [
    process.env.FIRESTORE_EMULATOR_HOST
      ? '<rootDir>/test/setupJestAfterEnvEmulator.ts'
      : '<rootDir>/test/setupJestAfterEnvSystem.ts'
  ]
}
