import { Ref } from '../ref';
import { Collection } from '../collection';
/**
 * The subcollection function type.
 */
export declare type Subcollection<Model, ParentModel> = (ref: Ref<ParentModel> | string) => Collection<Model>;
export declare type NestedSubcollection<Model, ParentModel, ParentIds extends Array<string>> = (ref: Ref<ParentModel> | ParentIds) => Collection<Model>;
export declare function subcollection<Model, ParentModel>(name: string, parentCollection: Collection<ParentModel>): Subcollection<Model, ParentModel>;
export declare function subcollection<Model, SubcollectionModel, SubcollectionParentModel>(name: string, parentSubcollection: Subcollection<SubcollectionModel, SubcollectionParentModel>): NestedSubcollection<Model, SubcollectionModel, [string, string]>;
export declare function subcollection<Model, SubcollectionModel, SubcollectionParentModel, SubcollectionIds extends [string, string]>(name: string, parentSubcollection: NestedSubcollection<SubcollectionModel, SubcollectionParentModel, SubcollectionIds>): NestedSubcollection<Model, SubcollectionModel, [string, string, string]>;
export declare function subcollection<Model, SubcollectionModel, SubcollectionParentModel, SubcollectionIds extends [string, string, string]>(name: string, parentSubcollection: NestedSubcollection<SubcollectionModel, SubcollectionParentModel, SubcollectionIds>): NestedSubcollection<Model, SubcollectionModel, [
    string,
    string,
    string,
    string
]>;
export declare function subcollection<Model, SubcollectionModel, SubcollectionParentModel, SubcollectionIds extends [string, string, string, string]>(name: string, parentSubcollection: NestedSubcollection<SubcollectionModel, SubcollectionParentModel, SubcollectionIds>): NestedSubcollection<Model, SubcollectionModel, [
    string,
    string,
    string,
    string,
    string
]>;
