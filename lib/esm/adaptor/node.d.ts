/**
 * Node.js Firestore adaptor.
 */
import * as firestore from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import type { DocOptions, RuntimeEnvironment, ServerTimestampsStrategy } from '../types';
import type { DocumentMetaData } from './types';
export declare type Adaptor = {
    firestore: admin.firestore.Firestore;
    consts: AdaptorConsts;
    environment: RuntimeEnvironment;
    getDocMeta: (snapshot: admin.firestore.DocumentSnapshot) => DocumentMetaData | {};
    getDocData: (snapshot: admin.firestore.DocumentSnapshot, options?: DocOptions<ServerTimestampsStrategy>) => FirestoreDocumentData | undefined;
};
export declare type AdaptorFirestore = () => admin.firestore.Firestore;
export declare type AdaptorConsts = {
    DocumentReference: typeof admin.firestore.DocumentReference;
    Timestamp: typeof admin.firestore.Timestamp;
    FieldPath: typeof admin.firestore.FieldPath;
    FieldValue: typeof admin.firestore.FieldValue;
};
export default function adaptor(): Promise<Adaptor>;
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
export declare type FirestoreQuerySnapshot<T = FirestoreDocumentData> = firestore.QuerySnapshot<T>;
export declare type FirestoreDocumentSnapshot<T = FirestoreDocumentData> = firestore.DocumentSnapshot<T>;
