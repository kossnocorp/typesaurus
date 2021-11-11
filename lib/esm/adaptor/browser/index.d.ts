/**
 * Browser Firestore adaptor.
 */
import firebase from 'firebase/app';
import 'firebase/firestore';
import type { DocOptions, ServerTimestampsStrategy } from '../../types';
export default function adaptor(): Promise<{
    firestore: firebase.firestore.Firestore;
    consts: {
        DocumentReference: typeof firebase.firestore.DocumentReference;
        Timestamp: typeof firebase.firestore.Timestamp;
        FieldPath: typeof firebase.firestore.FieldPath;
        FieldValue: typeof firebase.firestore.FieldValue;
    };
    environment: string;
    getDocMeta: (snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
        fromCache: boolean;
        hasPendingWrites: boolean;
    };
    getDocData: (snapshot: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>, options?: DocOptions<ServerTimestampsStrategy> | undefined) => firebase.firestore.DocumentData | undefined;
}>;
export declare function injectAdaptor(): void;
