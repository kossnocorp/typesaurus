import { FirestoreDocumentReference } from '.';
export declare function getAll(...docs: FirestoreDocumentReference[]): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>[]>;
