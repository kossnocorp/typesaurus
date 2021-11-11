/**
 * Lazy browser Firestore adaptor.
 */
import type { DocOptions, ServerTimestampsStrategy } from '../../types';
import type firebase from 'firebase';
export default function adaptor(): Promise<{
    firestore: firebase.firestore.Firestore;
    consts: {
        DocumentReference: typeof import("firebase").default.firestore.DocumentReference;
        Timestamp: typeof import("firebase").default.firestore.Timestamp;
        FieldPath: typeof import("firebase").default.firestore.FieldPath;
        FieldValue: typeof import("firebase").default.firestore.FieldValue;
    };
    environment: string;
    getDocMeta: (snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
        fromCache: boolean;
        hasPendingWrites: boolean;
    };
    getDocData: (snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>, options?: DocOptions<ServerTimestampsStrategy> | undefined) => firebase.firestore.DocumentData | undefined;
}>;
export declare function injectAdaptor(): void;
