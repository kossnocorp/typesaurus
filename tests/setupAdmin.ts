import * as admin from 'firebase-admin'

admin.initializeApp()

jest.setTimeout(process.env.FIRESTORE_EMULATOR_HOST ? 15000 : 25000)
