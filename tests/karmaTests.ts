import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { schema } from "../src";

const projectId = process.env.FIREBASE_PROJECT_ID;
const apiKey = process.env.FIREBASE_API_KEY;

if (!projectId || !apiKey)
  throw new Error("FIREBASE_PROJECT_ID and FIREBASE_API_KEY must be set");

// Test that the schema works before initializing the app
schema(($) => ({
  test: $.collection<{}>(),
}));

initializeApp({ apiKey, projectId });

if (process.env.FIRESTORE_EMULATOR_HOST) {
  const db = getFirestore();
  connectFirestoreEmulator(db, "localhost", 8080);
} else {
  const username = process.env.FIREBASE_USERNAME;
  const password = process.env.FIREBASE_PASSWORD;

  if (!username || !password)
    throw new Error("FIREBASE_USERNAME and FIREBASE_PASSWORD must be set");

  const auth = getAuth();

  beforeAll(() => signInWithEmailAndPassword(auth, username, password));
}

const testsContext = require.context(
  "../src/",
  true,
  /(tests\/.+\.ts|\/tests\.ts)$/,
);
testsContext.keys().forEach(testsContext);
