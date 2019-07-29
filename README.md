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

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
