# Typesaurus

TypeScript-first ORM for Firestore.

## Installation

TODO

## Get started

### Add data

```ts
import store from 'typesaurus'

type User = { name: string }
const users = collection<User>('users')

// Add a document to a collection with auto-generated id
store.add(users, { name: 'Sasha' })
//=> Promise<Doc<User>>

// Set or overwrite a document with given id
store.set(users, '42', { name: 'Sasha' })
//=> Promise<Doc<User>>

// Update a document with given id
store.update(users, '42', { name: 'Sasha' })
//=> Promise<void>
```

### Read data

```ts
import store from 'typesaurus'
type User = { name: string }
const users = collection<User>('users')

// Get a document with given id
store.get(users, '42')
//=> Promise<Doc<User> | undefined>

// Get all documents in a collection
store.all(users)
//=> Promise<Doc<User>[]>

// Query collection
store.query(users, [store.where('name', '===', 'Sasha')])
//=> Promise<Doc<User>[]>
```

### Remove data

```ts
import store from 'typesaurus'
type User = { name: string }
const users = collection<User>('users')

// Remove a document with given id
store.clear(users, '42')
//=> Promise<void>
```

## API

## Usage

### Query data from collections

```ts
import { collection, ref, getRef } from 'typesaurus'

// 1. Define your models using interfaces and types

interface User {
  name: string
}

interface Order {
  username: string
  order: string
  time: number
}

// 2. Define collections

const schema = {
  users: collection<User>('users'),
  orders: collection<Order>('orders')
}

// 3. Add data

getRef(ref(schema.users, 'kossnocorp'))

const newUsername = 'newuser1234'

setRef(ref(schema.users, newUsername), { name: 'New User 1234' })

pushItem(schema.orders, { name: 'Sasha' })

queryItems(schema.orders, ({ where, order }) => [
  where('username', 'newuser1234'),
  order('time', 'desc')
])
```

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
