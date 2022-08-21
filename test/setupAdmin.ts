import * as admin from 'firebase-admin'

admin.initializeApp()

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  jest.setTimeout(25000)
}
