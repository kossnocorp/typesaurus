# 🦕 Typesaurus

TypeScript-first ODM for Firestore.

_Looking for **React** adaptor?_ Check [Typesaurus React](https://github.com/kossnocorp/typesaurus-react)!

**Why?**

- Designed with TypeScript's type inference in mind
- Universal code (browser & Node.js)
- Functional API
- Maximum type-safety
- Autocomplete
- Say goodbye to `any`!
- Say goodbye to exceptions!

<hr>
<div align="center">
🔥🔥🔥 <strong>The project is sponsored by <a href='https://backupfire.dev/'>Backup Fire</a>, backup service for Firebase</strong> 🔥🔥🔥
</div>
<hr>

## Installation

The library is available as an [npm package](https://www.npmjs.com/package/typesaurus).
To install Typesaurus run:

```sh
npm install typesaurus@7 --save
# Or using Yarn:
yarn add typesaurus@7
```

_Note that Typesaurus requires `firebase` package to work in the web environment and `firebase-admin` to work in Node.js. These packages aren't listed as dependencies,
so that they won't install automatically along with the Typesaurus package._

## Configuration

Typesaurus does not require additional configuration, however **when using with ESM-enabled bundler, you should transpile `node_modules`**. TypeScript preserves many modern languages features when it compiles to ESM code. So if you have to support older browsers, use Babel to process the dependencies code

## Get started

### Initialization

To start working with Typesaurus, initialize Firebase normally.

In the web environment ([see Firebase docs](https://firebase.google.com/docs/web/setup#add-sdks-initialize)):

```ts
import * as firebase from 'firebase/app'
import 'firebase/firestore'

firebase.initializeApp({
  // Project configuration
})
```

In Node.js ([see Firebase docs](https://firebase.google.com/docs/admin/setup#initialize-sdk)):

```ts
import * as admin from 'firebase-admin'

admin.initializeApp()
```

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
//=> Promise<Doc<User> | null>

// Get all documents in a collection
all(users)
//=> Promise<Doc<User>[]>

// Query collection
query(users, [where('name', '===', 'Sasha')])
//=> Promise<Doc<User>[]>
```

### Remove data

```ts
import { collection, remove } from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

// Remove a document with given id
remove(users, '42')
//=> Promise<void>
```

## API Reference

### Query data

- [`all`](https://typesaurus.com/modules/_all_index_.html#all) - Returns all documents in a collection.
- [`get`](https://typesaurus.com/modules/_get_index_.html#get) - Retrieves a document from a collection.
- [`getMany`](https://typesaurus.com/modules/_getmany_index_.html#getMany) - Retrieves multiple documents from a collection.
- [`query`](https://typesaurus.com/modules/_query_index_.html#query-1) - Queries passed collection using query objects ([`order`](https://typesaurus.com/modules/_order_index_.html#order), [`where`](https://typesaurus.com/modules/_where_index_.html#where), [`limit`](https://typesaurus.com/modules/_limit_index_.html#limit)).

Query helpers:

- [`order`](https://typesaurus.com/modules/_order_index_.html#order) - Creates order query object with given field, ordering method and pagination cursors.
- [`limit`](https://typesaurus.com/modules/_limit_index_.html#limit) - Creates a limit query object. It's used to paginate queries.
- [`where`](https://typesaurus.com/modules/_where_index_.html#where) - Creates where query with array-contains filter operation.
- [`docId`](https://typesaurus.com/modules/_docId_index_.html#docId) - Constant-helper that allows to sort or order by the document ID.

Pagination helpers:

- [`endAt`](https://typesaurus.com/modules/_cursor_index_.html#endat) - Ends the query results on the given value.
- [`endBefore`](https://typesaurus.com/modules/_cursor_index_.html#endbefore) - Ends the query results before the given value.
- [`startAfter`](https://typesaurus.com/modules/_cursor_index_.html#startafter) - Start the query results after the given value.
- [`startAt`](https://typesaurus.com/modules/_cursor_index_.html#startat) - Start the query results on the given value.

Real-time:

- [`onAll`](https://typesaurus.com/modules/_onall_index_.html#onall) - Subscribes to all documents in a collection.
- [`onGet`](https://typesaurus.com/modules/_onget_index_.html#onget) - Subscribes to the given document.
- [`onGetMany`](https://typesaurus.com/modules/_ongetmany_index_.html#ongetmany) - Subscribes to multiple documents from a collection.
- [`onQuery`](https://typesaurus.com/modules/_onquery_index_.html#onquery) - Subscribes to a collection query built using query objects ([`order`](https://typesaurus.com/modules/_order_index_.html#order), [`where`](https://typesaurus.com/modules/_where_index_.html#where), [`limit`](https://typesaurus.com/modules/_limit_index_.html#limit)).

### Operations

- [`add`](https://typesaurus.com/modules/_add_index_.html#add) - Adds a new document with a random id to a collection.
- [`set`](https://typesaurus.com/modules/_set_index_.html#set) - Sets a document to the given data.
- [`update`](https://typesaurus.com/modules/_update_index_.html#update) - Updates a document.
- [`upset`](https://typesaurus.com/modules/_upset_index_.html#upset) - Updates or sets a document.
- [`remove`](https://typesaurus.com/modules/_remove_index_.html#remove) - Removes a document.

Operation helpers:

- [`field`](https://typesaurus.com/modules/_field_index_.html#field-1) - Creates a field object. It's used to update nested maps.
- [`value`](https://typesaurus.com/modules/_value_index_.html#value) - Creates a value object. It's used to update map values using special operations i.e. `arrayRemove`, `serverDate`, `increment`, etc.

### Constructors

- [`collection`](https://typesaurus.com/modules/_collection_index_.html#collection-1) - Creates a collection object.
- [`subcollection`](https://typesaurus.com/modules/_subcollection_index_.html#subcollection-1) - Creates a subcollection function which accepts parent document reference and returns the subcollection transformed into a collection object.
- [`group`](https://typesaurus.com/modules/_group_index_.html#group) - Creates a collection group object.
- [`doc`](https://typesaurus.com/modules/_doc_index_.html#doc-1) - Creates a document object.
- [`ref`](https://typesaurus.com/modules/_ref_index_.html#ref-1) - Creates reference object to a document in given collection with given id.

### Transactions and batched writes

- [`batch`](https://typesaurus.com/modules/_batch_index_.html#batch) - Inits batched writes.
- [`transaction`](https://typesaurus.com/modules/_transaction_index_.html#transaction) - Performs transaction.

### Testing

Functions to be used with [`@firebase/rules-unit-testing`](https://firebase.google.com/docs/rules/unit-tests#run_local_tests):

- [`injectTestingAdaptor`](https://typesaurus.com/modules/_testing_index_.html#injecttestingadaptor) - Injects the testing adaptor and sets the given app to be used for Firestore operations.
- [`injectApp`](https://typesaurus.com/modules/_testing_index_.html#setapp) - Sets the given app to be used for Firestore operations.

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
