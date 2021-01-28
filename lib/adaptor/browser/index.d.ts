/**
 * Browser Firestore adaptor.
 */
import * as firebase from 'firebase/app';
import 'firebase/firestore';
export default function adaptor(): Promise<{
    firestore: firebase.firestore.Firestore;
    consts: {
        DocumentReference: typeof firebase.firestore.DocumentReference;
        Timestamp: typeof firebase.firestore.Timestamp;
        FieldPath: typeof firebase.firestore.FieldPath;
        FieldValue: typeof firebase.firestore.FieldValue;
        GeoPoint: typeof firebase.firestore.GeoPoint;
    };
    getDocMeta: (snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
        fromCache: boolean;
        hasPendingWrites: boolean;
    };
}>;
export declare function injectAdaptor(): void;
