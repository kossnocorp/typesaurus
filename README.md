# Storytype

TypeScript-first ORM for Firestore.

## Installation

TODO

## Get started

### Add data

```ts
import store from 'storetype'

type User = { name: string }
const users = collection<User>('users')
store.add(users, { name: 'Sasha' })
// await addDoc(users, { name: 'Sasha' })
```

### Read data

```ts
import { collection, getDoc } from 'storetype'
type User = { name: string }
const users = collection<User>('users')
await addDoc(users, { name: 'Sasha' })
```

### API

## Usage

### Query data from collections

```ts
import { collection, ref, getRef } from 'storetype'

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
