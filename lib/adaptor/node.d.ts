/**
 * Node.js Firestore adaptor.
 */
import * as firestore from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import { Metadata } from '../doc';
export declare type Adaptor = {
    firestore: admin.firestore.Firestore;
    consts: AdaptorConsts;
    getDocMeta: (snapshot: admin.firestore.DocumentSnapshot) => Metadata | undefined;
};
export declare type AdaptorFirestore = () => admin.firestore.Firestore;
export declare type AdaptorConsts = {
    DocumentReference: typeof admin.firestore.DocumentReference;
    Timestamp: typeof admin.firestore.Timestamp;
    GeoPoint: typeof admin.firestore.GeoPoint;
    FieldPath: typeof admin.firestore.FieldPath;
    FieldValue: typeof admin.firestore.FieldValue;
};
export default function adaptor(): Promise<{
    firestore: firestore.Firestore;
    consts: AdaptorConsts;
    getDocMeta: (_snapshot: admin.firestore.DocumentSnapshot) => undefined;
}>;
export declare function injectAdaptor(firestore: AdaptorFirestore, consts: AdaptorConsts): void;
export declare type FirestoreQuery = admin.firestore.Query;
export declare type FirestoreDocumentReference = admin.firestore.DocumentReference;
export declare type FirestoreDocumentData = admin.firestore.DocumentData;
export declare type FirestoreTimestamp = admin.firestore.Timestamp;
export declare type FirebaseWriteBatch = admin.firestore.WriteBatch;
export declare type FirestoreCollectionReference = admin.firestore.CollectionReference;
export declare type FirestoreTransaction = admin.firestore.Transaction;
export declare type FirestoreOrderByDirection = firestore.OrderByDirection;
export declare type FirestoreWhereFilterOp = firestore.WhereFilterOp;
