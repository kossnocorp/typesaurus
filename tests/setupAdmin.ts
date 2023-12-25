import * as admin from "firebase-admin";
import { schema } from "../src";

// Test that the schema works before initializing the app
schema(($) => ({
  test: $.collection<{}>(),
}));

admin.initializeApp();

jest.setTimeout(process.env.FIRESTORE_EMULATOR_HOST ? 15000 : 25000);
