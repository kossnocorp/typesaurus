import type { Typesaurus } from '../..'
import type { TypesaurusTransaction } from '../../types/transaction'

export const transaction: TypesaurusTransaction.Function = (db, options) => {
  return {
    read: (callback) => {
      callback(readHelpers(db))

      return {
        write: (callback) => {}
      }
    }
  }
}

// export function transaction<
//   Schema extends Typesaurus.PlainSchema,
//   Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
// >(
//   db: Typesaurus.RootDB<Schema>,
//   options?: Typesaurus.OperationOptions<Environment>
// ): TypesaurusTransaction.ReadChain<Schema, Environment> {
//   return {
//     read: (
//       callback: TypesaurusTransaction.ReadFunction<Schema, Environment>
//     ) => {
//       callback(readHelpers(db))
//       return {
//         write: (
//           callback: TypesaurusTransaction.WriteFunction<Schema, Environment>
//         ) => {}
//       }
//     }
//   }
// }

function readHelpers<
  Schema extends Typesaurus.PlainSchema,
  Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
>(
  db: Typesaurus.RootDB<Schema>
): TypesaurusTransaction.ReadHelpers<Schema, Environment> {
  return {
    db: readDB(db)
  }
}

function readDB<
  Schema extends Typesaurus.PlainSchema,
  Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
>(
  db: Typesaurus.RootDB<Schema>
): TypesaurusTransaction.ReadDB<Schema, Environment> {
  const processedDB: TypesaurusTransaction.ReadDB<Schema, Environment> = {}

  Object.entries(db).forEach(([key, value]) => {
    if (key === 'groups' || key === 'id') return

    processedDB[key] = value
  })

  // return Object.entries(schema).reduce<Typesaurus.RichSchema>(
  //   (enrichedSchema, [path, plainCollection]) => {
  //     const collection = new RichCollection(
  //       nestedPath ? `${nestedPath}/${path}` : path
  //     )
  //     enrichedSchema[path] =
  //       'schema' in plainCollection
  //         ? new Proxy<Typesaurus.NestedRichCollection<any, any>>(() => {}, {
  //             get: (_target, prop: keyof typeof collection) => collection[prop],
  //             apply: (_target, prop, [id]: [string]) =>
  //               enrichSchema(plainCollection.schema, `${collection.path}/${id}`)
  //           })
  //         : collection
  //     return enrichedSchema
  //   },
  //   {}
  // )

  return processedDB
}

class ReadCollection<Model>
  implements TypesaurusTransaction.ReadCollection<Model>
{
  type: 'collection' = 'collection'

  path: string

  constructor(path: string) {
    this.path = path
  }

  // ref(id: string): Typesaurus.Ref<Model> {
  //   return new Ref<Model>(this, id)
  // }

  // doc<
  //   Source extends Typesaurus.DataSource,
  //   DateStrategy extends Typesaurus.ServerDateStrategy,
  //   Environment extends Typesaurus.RuntimeEnvironment
  // >(
  //   id: string,
  //   data: Model
  // ): Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment> {
  //   return new Doc<Model>(this, id, data)
  // }

  async add<Environment extends Typesaurus.RuntimeEnvironment>(
    data: Typesaurus.WriteModelArg<Model, Environment>
  ) {
    const dataToAdd =
      typeof data === 'function' ? data(this.writeHelpers()) : data
    const firebaseRef = await this.firebaseCollection().add(
      unwrapData(dataToAdd)
    )

    return this.ref(firebaseRef.id)
  }

  async set<Environment extends Typesaurus.RuntimeEnvironment>(
    id: string,
    data: Typesaurus.WriteModelArg<Model, Environment>
  ) {
    const dataToSet =
      typeof data === 'function' ? data(this.writeHelpers()) : data
    await this.firebaseDoc(id).set(unwrapData(dataToSet))
    return this.ref(id)
  }

  async upset<Environment extends Typesaurus.RuntimeEnvironment>(
    id: string,
    data: Typesaurus.WriteModelArg<Model, Environment>
  ) {
    const dataToUpset =
      typeof data === 'function' ? data(this.writeHelpers()) : data
    await this.firebaseDoc(id).set(unwrapData(dataToUpset), { merge: true })
    return this.ref(id)
  }

  async update<Environment extends Typesaurus.RuntimeEnvironment>(
    id: string,
    data: Typesaurus.UpdateModelArg<Model, Environment>
  ) {
    const updateData =
      typeof data === 'function' ? data(this.updateHelpers()) : data

    const update = Array.isArray(updateData)
      ? updateData.reduce((acc, field) => {
          if (!field) return
          const { key, value } = field
          acc[Array.isArray(key) ? key.join('.') : key] = value
          return acc
        }, {} as Record<string, any>)
      : updateData

    await this.firebaseDoc(id).update(unwrapData(update))
    return this.ref(id)
  }

  async remove(id: string) {
    await this.firebaseDoc(id).delete()
    return this.ref(id)
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
    queries: Typesaurus.QueryGetter<Model>
  ): Typesaurus.SubscriptionPromise<
    Typesaurus.EnvironmentDoc<Model, Source, DateStrategy, Environment>[],
    Typesaurus.SubscriptionListMeta<Model, Source, DateStrategy, Environment>
  > {
    return query(this.adapter(), queries)
  }

  get<
    Source extends Typesaurus.DataSource,
    DateStrategy extends Typesaurus.ServerDateStrategy,
    Environment extends Typesaurus.RuntimeEnvironment
  >(
    id: string
  ): TypesaurusUtils.SubscriptionPromise<Typesaurus.EnvironmentDoc<
    Model,
    Source,
    DateStrategy,
    Environment
  > | null> {
    const doc = this.firebaseDoc(id)

    return new TypesaurusUtils.SubscriptionPromise({
      get: async () => {
        const firebaseSnap = await doc.get()
        const data = firebaseSnap.data()
        if (data)
          return this.doc<Source, DateStrategy, Environment>(id, wrapData(data))
        return null
      },

      subscribe: (onResult, onError) =>
        doc.onSnapshot((firebaseSnap) => {
          const data = firebaseSnap.data()
          if (data)
            onResult(
              this.doc<Source, DateStrategy, Environment>(id, wrapData(data))
            )
          else onResult(null)
        }, onError)
    })
  }
}
