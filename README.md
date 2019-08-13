# 🦕 Typesaurus

TypeScript-first ORM for Firestore.

**Why?**

- Designed with TypeScript's type inference in mind
- Universal code (browser & Node.js)
- Functional API
- Maximum type-safety
- Autocomplete
- Say good bye to `any`!
- Say good bye to exceptions!

## Installation

The library is available as an [npm package](https://www.npmjs.com/package/typesaurus).
To install the package run:

```sh
npm install typesaurus --save
# or with yarn
yarn add typesaurus
```

## Get started

### Add data

```ts
import { collection, add, set, update } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

// Add a document to a collection with auto-generated id
add(users, { name: 'Sasha' })
//=> Promise<Doc<User>>

// Set or overwrite a document with given id
set(users, '42', { name: 'Sasha' })
//=> Promise<Doc<User>>

// Update a document with given id
update(users, '42', { name: 'Sasha' })
//=> Promise<void>
```

### Read data

```ts
import { collection, get, all, query, where } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

// Get a document with given id
get(users, '42')
//=> Promise<Doc<User> | undefined>

// Get all documents in a collection
all(users)
//=> Promise<Doc<User>[]>

// Query collection
query(users, [where('name', '===', 'Sasha')])
//=> Promise<Doc<User>[]>
```

### Remove data

```ts
import { collection, clear } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

// Remove a document with given id
clear(users, '42')
//=> Promise<void>
```

## API Reference

### Query data

- [`all`](https://typesaurus.com/modules/_all_index_.html#all) - Returns all documents in a collection.
- [`get`](https://typesaurus.com/modules/_get_index_.html#get) - Retrieves a document from a collection.
- [`query`](https://typesaurus.com/modules/_query_index_.html#query-1) - Queries passed collection using query objects ([`order`](https://typesaurus.com/modules/_order_index_.html#order), [`where`](https://typesaurus.com/modules/_where_index_.html#where), [`limit`](https://typesaurus.com/modules/_limit_index_.html#limit)).

Query helpers:

- [`order`](https://typesaurus.com/modules/_order_index_.html#order) - Creates order query object with given field, ordering method and pagination cursors.
- [`limit`](https://typesaurus.com/modules/_limit_index_.html#limit) - Creates a limit query object. It's used to paginate queries.
- [`where`](https://typesaurus.com/modules/_where_index_.html) - Creates where query with array-contains filter operation.
- [`untypedWhereArrayContains`](https://typesaurus.com/modules/_where_index_.html#untypedwherearraycontains) - Creates where query with array-contains filter operation.

Pagination helpers:

- [`endAt`](https://typesaurus.com/modules/_cursor_index_.html#endat) - Ends the query results on the given value.
- [`endBefore`](https://typesaurus.com/modules/_cursor_index_.html#endbefore) - Ends the query results before the given value.
- [`startAfter`](https://typesaurus.com/modules/_cursor_index_.html#startafter) - Start the query results after the given value.
- [`startAt`](https://typesaurus.com/modules/_cursor_index_.html#startat) - Start the query results on the given value.

Real-time:

- [`onAll`](https://typesaurus.com/modules/_onall_index_.html#onall) - Subscribes to all documents in a collection.
- [`onGet`](https://typesaurus.com/modules/_onget_index_.html#onget) - Subscribes to the diven document.
- [`onQuery`](https://typesaurus.com/modules/_onquery_index_.html#onquery) - Subscribes to a collection query built using query objects ([`order`](https://typesaurus.com/modules/_order_index_.html#order), [`where`](https://typesaurus.com/modules/_where_index_.html#where), [`limit`](https://typesaurus.com/modules/_limit_index_.html#limit)).

### Operations

- [`add`](https://typesaurus.com/modules/_add_index_.html#add) - Adds a new document with a random id to a collection.
- [`set`](https://typesaurus.com/modules/_set_index_.html#set) - Sets a document to the given data.
- [`update`](https://typesaurus.com/modules/_update_index_.html#update) - Updates a document.
- [`clear`](https://typesaurus.com/modules/_clear_index_.html) - Removes a document.

Operation helpers:

- [`field`](https://typesaurus.com/modules/_field_index_.html#field-1) - Creates a field object. It's used to update nested maps.

### Constructors

- [`collection`](https://typesaurus.com/modules/_collection_index_.html) - Creates a collection object.
- [`subcollection`](https://typesaurus.com/modules/_subcollection_index_.html#subcollection-1) - Creates a subcollection function which accepts parent document reference and returns the subcollection trasnformed into a collection object.
- [`group`](https://typesaurus.com/modules/_group_index_.html#group) - Creates a collection group object.
- [`doc`](https://typesaurus.com/modules/_doc_index_.html#doc-1) - Creates a document object.
- [`ref`](https://typesaurus.com/modules/_ref_index_.html#ref-1) - Creates reference object to a document in given collection with given id.

### Transactions and batched writes

- [`batch`](https://typesaurus.com/modules/_batch_index_.html#batch) - Inits batched writes.
- [`transaction`](https://typesaurus.com/modules/_transaction_index_.html#transaction) - Performs transaction.

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
