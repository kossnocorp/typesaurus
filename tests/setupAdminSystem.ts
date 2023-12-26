import * as admin from "firebase-admin";
import serviceKey from "../secrets/key.json";
import { schema } from "../src";

// Test that the schema works before initializing the app
schema(($) => ({
  test: $.collection<{}>(),
}));

admin.initializeApp(
  serviceKey && {
    credential: admin.credential.cert(serviceKey as admin.ServiceAccount),
  },
);
