import { Doc } from '../doc';
/**
 * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
 */
export declare type DocChangeType = 'added' | 'removed' | 'modified';
export interface DocChange<Model> {
    /** The type of change ('added', 'modified', or 'removed'). */
    readonly type: DocChangeType;
    /** The document affected by this change. */
    readonly doc: Doc<Model>;
    /**
     * The index of the changed document in the result set immediately prior to
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange` objects
     * have been applied). Is -1 for 'added' events.
     */
    readonly oldIndex: number;
    /**
     * The index of the changed document in the result set immediately after
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange`
     * objects and the current `DocumentChange` object have been applied).
     * Is -1 for 'removed' events.
     */
    readonly newIndex: number;
}
/**
 * An options object that configures the snapshot contents of `onAll()` and `onQuery()`.
 */
export interface SnapshotInfo<Model> {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<Model>[];
    /** The number of documents in the QuerySnapshot. */
    readonly size: number;
    /** True if there are no documents in the QuerySnapshot. */
    readonly empty: boolean;
}
