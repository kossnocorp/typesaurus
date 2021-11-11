/**
 * Node.js Firestore adaptor.
 */
import * as admin from 'firebase-admin';
const adminFirestore = () => admin.firestore();
let currentFirestore = adminFirestore;
const adminConsts = {
    DocumentReference: admin.firestore.DocumentReference,
    Timestamp: admin.firestore.Timestamp,
    FieldPath: admin.firestore.FieldPath,
    FieldValue: admin.firestore.FieldValue
};
let currentConsts = adminConsts;
export default async function adaptor() {
    return {
        firestore: currentFirestore(),
        consts: currentConsts,
        environment: 'node',
        getDocMeta: () => ({}),
        getDocData: (snapshot) => snapshot.data()
    };
}
export function injectAdaptor(firestore, consts) {
    currentFirestore = firestore;
    currentConsts = consts;
}
//# sourceMappingURL=node.js.map