import { all, CollectionAdapter, pathToDoc, query } from '.'
import type { Typesaurus } from '../..'
import type { TypesaurusGroups } from '../../types/groups'
import { TypesaurusQuery } from '../../types/query'
import * as admin from 'firebase-admin'

export const groups: TypesaurusGroups.Function = (rootDB) => {
  const groups: TypesaurusGroups.Groups<unknown> = {}

  function extract<SchemaNode extends Typesaurus.PlainSchema>(
    db: Typesaurus.DB<SchemaNode>
  ) {
    Object.entries(db).forEach(([path, collection]) => {
      if (path in groups) return
      groups[path] = new Group(path)
      if ('schema' in collection) extract(collection.schema)
    })
  }
  extract(rootDB)

  return groups
}

class Group<Model> implements TypesaurusGroups.Group<Model> {
  name: string

  constructor(name: string) {
    this.name = name
  }

  all<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(): Typesaurus.SubscriptionPromise<
    Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
    Typesaurus.SubscriptionListMeta<Model, Source, DateStrategy, Environment>
  > {
    return all(this.adapter())
  }

  query<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(
    queries: TypesaurusQuery.QueryGetter<Model>
  ): Typesaurus.SubscriptionPromise<
    Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
    Typesaurus.SubscriptionListMeta<Model, Source, DateStrategy, Environment>
  > {
    return query(this.adapter(), queries)
  }

  private adapter<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(): CollectionAdapter<Model, Source, DateStrategy, Environment> {
    return {
      collection: () => this.firebaseCollection(),
      doc: (snapshot) => pathToDoc<Model>(snapshot.ref.path, snapshot.data())
    }
  }

  private firebaseCollection() {
    return admin.firestore().collectionGroup(this.name)
  }
}
