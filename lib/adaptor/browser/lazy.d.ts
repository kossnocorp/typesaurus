/**
 * Lazy browser Firestore adaptor.
 */
export default function adaptor(): Promise<{
    firestore: import("firebase").firestore.Firestore;
    consts: {
        DocumentReference: typeof import("firebase").firestore.DocumentReference;
        Timestamp: typeof import("firebase").firestore.Timestamp;
        GeoPoint: typeof import("firebase").firestore.GeoPoint;
        FieldPath: typeof import("firebase").firestore.FieldPath;
        FieldValue: typeof import("firebase").firestore.FieldValue;
    };
    getDocMeta: (snapshot: import("firebase").firestore.DocumentSnapshot<import("firebase").firestore.DocumentData>) => {
        fromCache: boolean;
        hasPendingWrites: boolean;
    };
}>;
export declare function injectAdaptor(): void;
