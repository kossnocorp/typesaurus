module.exports = {
  roots: ['<rootDir>/src/'],
  setupFiles: [
    process.env.FIRESTORE_EMULATOR_HOST
      ? '<rootDir>/test/setupJestLocal.ts'
      : '<rootDir>/test/setupJestSystem.ts'
  ],
  setupFilesAfterEnv: process.env.FIRESTORE_EMULATOR_HOST
    ? []
    : ['<rootDir>/test/setupJestSystemAfterEnv.ts']
}
