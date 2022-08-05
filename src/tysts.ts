import type { Typesaurus } from '.'
import { schema } from './adapter/admin'
import { TypesaurusUtils } from './utils'

interface Post {
  title: string
  text: string
  likeIds?: string[]
  likes?: number
}

interface Update {
  title: string
  text: string
}

interface Comment {
  text: string
}

interface PostLike extends Like {
  comment: string
}

interface Like {
  userId: string
}

interface Account {
  name: string
  createdAt: Typesaurus.ServerDate

  contacts: {
    email: string
    phone?: string
  }

  emergencyContacts?: {
    name: string
    phone: string
    email?: string
  }

  nested1Required: {
    nested12Required: {
      hello: string
      world?: string
    }
  }

  nested1Optional?: {
    required12: string
    nested12Optional?: {
      hello: string
      world?: string
    }
  }

  counters?: {
    [postId: string]:
      | undefined
      | {
          likes?: number
        }
  }
}

interface User {
  name: string
  contacts: {
    email: string
    phone?: string
  }
  birthdate?: Date
  // Allow setting only server date on client,
  // but allow on server
  createdAt: Typesaurus.ServerDate
}

// Flat schema
const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>(),
  accounts: $.collection<Account>()
}))

async function doc() {
  const dbUser = await db.users.get('sasha')
  if (!dbUser) return

  const manualUser = db.users.doc('sasha', {
    name: 'Sasha',
    contacts: {
      email: 'koss@nocorp.me'
    },
    createdAt: new Date() as Typesaurus.ServerDate
  })

  // Runtime environment

  if (dbUser.environment === 'server') {
    dbUser.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    dbUser.data.createdAt.getDay()
  }

  if (manualUser.environment === 'server') {
    manualUser.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    manualUser.data.createdAt.getDay()
  }

  // Source

  if (dbUser.source === 'database') {
    dbUser.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    dbUser.data.createdAt.getDay()
  }

  if (manualUser.source === 'database') {
    manualUser.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    manualUser.data.createdAt.getDay()
  }

  // Server date strategy

  if (dbUser.dateStrategy === 'estimate') {
    dbUser.data.createdAt.getDay()
  } else if (dbUser.dateStrategy === 'previous') {
    dbUser.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    dbUser.data.createdAt.getDay()
  }

  if (manualUser.dateStrategy === 'estimate') {
    manualUser.data.createdAt.getDay()
  } else if (manualUser.dateStrategy === 'previous') {
    manualUser.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    manualUser.data.createdAt.getDay()
  }
}

async function update() {
  // Simple update

  await db.users.update('sasha', {
    name: 'Alexander'
  })

  // Update with helpers

  await db.users.update('sasha', ($) => ({
    name: 'Sasha',
    birthdate: $.remove(),
    createdAt: $.serverDate()
  }))

  await db.posts.update('post-id', ($) => ({
    likes: $.increment(5),
    likeIds: $.arrayUnion('like-id')
  }))

  await db.posts.update('post-id', ($) => ({
    likeIds: $.arrayRemove('like-id')
  }))

  // Enforce required fields

  // @ts-expect-error - name is required
  await db.users.update('sasha', ($) => ({
    name: $.remove()
  }))

  // @ts-expect-error - name is required
  await db.users.update('sasha', ($) => ({
    name: undefined
  }))

  // Works with nested fields

  await db.users.update('sasha', ($) => ({
    contacts: {
      email: 'koss@nocorp.me',
      phone: $.remove()
    }
  }))

  // @ts-expect-error - email is required
  await db.users.update('sasha', ($) => ({
    contacts: {
      email: $.remove()
    }
  }))

  await db.accounts.update('sasha', ($) =>
    $.field('nested1Optional', $.remove())
  )

  // Single field update

  await db.accounts.update('sasha', ($) => $.field('name', 'Alexander'))

  // Multiple fields update

  await db.accounts.update('sasha', ($) => [
    $.field('name', 'Alexander'),
    $.field('createdAt', $.serverDate())
  ])

  // Nested fields

  await db.accounts.update('sasha', ($) =>
    $.field('contacts', 'phone', '+65xxxxxxxx')
  )

  await db.accounts.update('sasha', ($) =>
    // @ts-expect-error - wrong type
    $.field('contacts', 'phone', 6500000000)
  )

  await db.accounts.update('sasha', ($) =>
    // @ts-expect-error - can't update because emergencyContacts can be undefined
    $.field('emergencyContacts', 'phone', '+65xxxxxxxx')
  )

  await db.accounts.update('sasha', ($) =>
    // @ts-expect-error - emergencyContacts must have name and phone
    $.field('emergencyContacts', {
      name: 'Sasha'
    })
  )

  await db.accounts.update('sasha', ($) =>
    $.field('emergencyContacts', {
      name: 'Sasha',
      phone: '+65xxxxxxxx'
    })
  )

  // Deeply nested field corner cases

  await db.accounts.update('sasha', ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!'
    })
  )

  await db.accounts.update('sasha', ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!',
      world: 'World!'
    })
  )

  await db.accounts.update('sasha', ($) =>
    // @ts-expect-error - can't update without hello
    $.field('nested1Required', 'nested12Required', {
      world: 'World!'
    })
  )

  await db.accounts.update('sasha', ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - should not update because requried12 on nested1Optional is required
      hello: 'Hello!'
    })
  )

  await db.accounts.update('sasha', ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - nested1Optional has required12, so can't update
      world: 'World!'
    })
  )

  // Nested fields with records

  const postId = 'post-id'

  await db.accounts.update('sasha', ($) =>
    $.field('counters', { [postId]: { likes: 5 } })
  )

  await db.accounts.update('sasha', ($) =>
    $.field('counters', postId, { likes: 5 })
  )

  await db.accounts.update('sasha', ($) =>
    $.field('counters', postId, 'likes', $.increment(1))
  )
}

async function groups() {
  interface Book {
    title: string
  }

  interface Order {
    book: Typesaurus.Ref<Book>
    quantity: number
    date?: Date
  }

  interface Comment {
    text: string
  }

  interface OrderComment {
    rating: number
  }

  interface Like {
    userId: string
  }

  const db1 = schema(($) => ({
    books: $.collection<Book>(),

    orders: $.collection<Order>()
  }))

  type Schema1 = typeof db1 extends Typesaurus.RootDB<infer Schema>
    ? Schema
    : never

  const db2 = schema(($) => ({
    books: $.sub($.collection<Book>(), {
      comments: $.collection<Comment>(),
      likes: $.collection<Like>()
    }),

    orders: $.sub($.collection<Order>(), {
      comments: $.collection<OrderComment>()
    })
  }))

  type Schema2 = typeof db2 extends Typesaurus.RootDB<infer Schema>
    ? Schema
    : never

  const db3 = schema(($) => ({
    books: $.sub($.collection<Book>(), {
      comments: $.collection<Comment>(),
      likes: $.collection<Like>()
    }),

    orders: $.sub($.collection<Order>(), {
      comments: $.sub($.collection<OrderComment>(), {
        likes: $.collection<Like>()
      })
    })
  }))

  type Schema3 = typeof db3 extends Typesaurus.RootDB<infer Schema>
    ? Schema
    : never

  // ExtractDBModels

  type ExampleAQ30 = Typesaurus.ExtractGroupModels<{
    books: Typesaurus.PlainCollection<Book>
    orders: Typesaurus.PlainCollection<Order>
  }>

  type ResultAQ30 = Assert<
    {
      books: Book
      orders: Order
    },
    ExampleAQ30
  >

  type ExampleRVD2 = Typesaurus.ExtractGroupModels<Schema3>

  type ResultRVD2 = Assert<
    {
      books: Book
      orders: Order
    },
    ExampleRVD2
  >

  // ConstructGroups

  type ExampleOSE7 = Typesaurus.ConstructGroups<
    { books: number; comics: number },
    { books: string; plants: string },
    { plants: boolean }
  >

  type ResultOSE7 = Assert<
    {
      books: Typesaurus.Group<string | number>
      comics: Typesaurus.Group<number>
      plants: Typesaurus.Group<string | boolean>
    },
    ExampleOSE7
  >

  type ExampleFSPP = Typesaurus.ConstructGroups<
    { books: number; comics: number },
    { books: string; plants: string },
    Typesaurus.ExtractGroupModels<Schema3>
  >

  type ResultFSPP = Assert<
    {
      books: Typesaurus.Group<string | number | Book>
      orders: Typesaurus.Group<Order>
      comics: Typesaurus.Group<number>
      plants: Typesaurus.Group<string>
    },
    ExampleFSPP
  >

  type ExampleYHWG = Typesaurus.ConstructGroups<
    { books: number } | { comics: number },
    { books: string; plants: string } | {},
    Typesaurus.ExtractGroupModels<Schema3>
  >

  type ResultYHWG = Assert<
    {
      books: Typesaurus.Group<string | number | Book>
      orders: Typesaurus.Group<Order>
      comics: Typesaurus.Group<number>
      plants: Typesaurus.Group<string>
    },
    ExampleYHWG
  >

  // GroupsLevel

  // Root level

  type Example1PWX = Typesaurus.GroupsLevel1<Schema1>

  type Result1PWX = Assert<
    {
      books: Book
      orders: Order
    },
    Example1PWX
  >

  type ExampleCCR2 = Typesaurus.GroupsLevel1<Schema2>

  type ResultCCR2 = Assert<
    {
      books: Book
      orders: Order
    },
    ExampleCCR2
  >

  type ExampleGQLP = Typesaurus.GroupsLevel1<Schema3>

  type ResultGQLP = Assert<
    {
      books: Book
      orders: Order
    },
    ExampleGQLP
  >

  // 2nd level

  type ExampleQJGO = Typesaurus.GroupsLevel2<Schema1>

  type ResultQJGO = Assert<{}, ExampleQJGO>

  type ExampleUMAX = Typesaurus.GroupsLevel2<Schema2>

  type ResultUMAX = Assert<{ comments: Comment | OrderComment }, ExampleUMAX>

  type Example4JFS = Typesaurus.GroupsLevel2<Schema3>

  type Result4JFS = Assert<{ comments: Comment | OrderComment }, Example4JFS>

  // 3rd level

  type ExampleMAJN = Typesaurus.GroupsLevel3<Schema1>

  type ResultMAJN = Assert<{}, ExampleMAJN>

  type ExampleWLYA = Typesaurus.GroupsLevel3<Schema2>

  type ResultWLYA = Assert<{}, ExampleWLYA>

  type ExampleXNAT = Typesaurus.GroupsLevel3<Schema3>

  type ResultXNAT = Assert<{ likes: Like } | {}, ExampleXNAT>

  // Groups

  // Root level

  type Example7DGC = Typesaurus.Groups<Schema1>

  type Result7DGC = Assert<
    {
      books: Typesaurus.Group<Book>
      orders: Typesaurus.Group<Order>
    },
    Example7DGC
  >

  // 2nd level

  type ExampleMIAM = Typesaurus.Groups<Schema1>

  type ResultMIAM = Assert<
    {
      books: Typesaurus.Group<Book>
      orders: Typesaurus.Group<Order>
    },
    ExampleMIAM
  >

  // 3rd level

  type ExampleM7US = Typesaurus.Groups<Schema3>

  type ResultM7US = Assert<
    {
      likes: Typesaurus.Group<Like>
      books: Typesaurus.Group<Book>
      comments: Typesaurus.Group<Comment | OrderComment>
      orders: Typesaurus.Group<Order>
    },
    ExampleM7US
  >

  // Functions

  db1.groups.books.all()

  db2.groups.comments.all()

  db2.groups.likes.all()

  db3.groups.comments.all()

  db3.groups.likes.all()
}

type Assert<Type1, _Type2 extends Type1> = true

function assert<Type>(arg: Type) {}
