module.exports = {
  roots: ['<rootDir>/src/'],
  setupFiles: [
    process.env.FIRESTORE_EMULATOR_HOST
      ? '<rootDir>/test/setupJestLocal.ts'
      : '<rootDir>/test/setupJestSystem.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setupJestAfterEnv.ts']
}
