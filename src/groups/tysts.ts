import { schema, ServerDate, Ref, groups } from '..'
import type { TypesaurusGroups } from '../types/groups'
import type { Typesaurus } from '../types/typesaurus'

interface User {
  name: string
  contacts: {
    email: string
    phone?: string
  }
  birthdate?: Date
  // Allow setting only server date on client,
  // but allow on server
  createdAt: ServerDate
}

interface Post {
  title: string
  text: string
  likeIds?: string[]
  likes?: number
}

interface Account {
  name: string
  createdAt: ServerDate

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

const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>(),
  accounts: $.collection<Account>()
}))

async function tysts() {
  interface Book {
    title: string
  }

  interface Order {
    book: Ref<Book, 'books'>
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

  interface Comic {
    title: string
  }

  interface Plant {
    name: string
    color: string
  }

  const db1 = schema(($) => ({
    books: $.collection<Book>(),

    orders: $.collection<Order>()
  }))

  type Schema1 = typeof db1

  const db2 = schema(($) => ({
    books: $.collection<Book>().sub({
      comments: $.collection<Comment>(),
      likes: $.collection<Like>()
    }),

    orders: $.collection<Order>().sub({
      comments: $.collection<OrderComment>()
    })
  }))

  type Schema2 = typeof db2

  const db3 = schema(($) => ({
    books: $.collection<Book>().sub({
      comments: $.collection<Comment>(),
      likes: $.collection<Like>()
    }),

    orders: $.collection<Order>().sub({
      comments: $.collection<OrderComment>().sub({
        likes: $.collection<Like>()
      })
    })
  }))

  type Schema3 = typeof db3

  // ExtractDBModels

  type ExampleAQ30 = TypesaurusGroups.ExtractGroupModels<{
    books: Typesaurus.RichCollection<[Book, 'books']>
    orders: Typesaurus.RichCollection<[Order, 'orders']>
  }>

  type ResultAQ30 = Assert<
    {
      books: [Book, 'books']
      orders: [Order, 'orders']
    },
    ExampleAQ30
  >

  type ExampleRVD2 = TypesaurusGroups.ExtractGroupModels<Schema3>

  type ResultRVD2 = Assert<
    {
      books: [Book, 'books']
      orders: [Order, 'orders']
    },
    ExampleRVD2
  >

  // ConstructGroups

  type ExampleOSE7 = TypesaurusGroups.ConstructGroups<
    { books: [number, 'books']; comics: [number, 'comics'] },
    { books: [string, 'archive/books']; plants: [string, 'plants'] },
    { plants: [boolean, 'archive/plants'] }
  >

  type ResultOSE7 = Assert<
    {
      books: TypesaurusGroups.Group<[Book, 'books'] | [Book, 'archive/books']>
      comics: TypesaurusGroups.Group<[Comic, 'comics']>
      plants: TypesaurusGroups.Group<
        [Plant, 'plants'] | [Plant, 'archive/plants']
      >
    },
    ExampleOSE7
  >

  type ExampleFSPP = TypesaurusGroups.ConstructGroups<
    { books: [Book, 'orders/books']; comics: [Comic, 'comics'] },
    { books: [Book, 'archive/books']; plants: [Plant, 'archive/plants'] },
    TypesaurusGroups.ExtractGroupModels<Schema3>
  >

  type ResultFSPP = Assert<
    {
      books: TypesaurusGroups.Group<
        [Book, 'books'] | [Book, 'archive/books'] | [Book, 'orders/books']
      >
      orders: TypesaurusGroups.Group<[Order, 'orders']>
      comics: TypesaurusGroups.Group<[Comic, 'comics']>
      plants: TypesaurusGroups.Group<[Plant, 'archive/plants']>
    },
    ExampleFSPP
  >

  type ExampleYHWG = TypesaurusGroups.ConstructGroups<
    { books: [Book, 'orders/books']; comics: [Comic, 'comics'] },
    { books: [Book, 'archive/books']; plants: [Plant, 'archive/plants'] } | {},
    TypesaurusGroups.ExtractGroupModels<Schema3>
  >

  type ResultYHWG = Assert<
    {
      books: TypesaurusGroups.Group<
        [Book, 'books'] | [Book, 'archive/books'] | [Book, 'orders/books']
      >
      orders: TypesaurusGroups.Group<[Order, 'orders']>
      comics: TypesaurusGroups.Group<[Comic, 'comics']>
      plants: TypesaurusGroups.Group<[Plant, 'archive/plants']>
    },
    ExampleYHWG
  >

  // GroupsLevel

  // Root level

  type Example1PWX = TypesaurusGroups.GroupsLevel1<Schema1>

  type Result1PWX = Assert<
    {
      books: [Book, 'books']
      orders: [Order, 'orders']
    },
    Example1PWX
  >

  type ExampleCCR2 = TypesaurusGroups.GroupsLevel1<Schema2>

  type ResultCCR2 = Assert<
    {
      books: [Book, 'books']
      orders: [Order, 'orders']
    },
    ExampleCCR2
  >

  type ExampleGQLP = TypesaurusGroups.GroupsLevel1<Schema3>

  type ResultGQLP = Assert<
    {
      books: [Book, 'books']
      orders: [Order, 'orders']
    },
    ExampleGQLP
  >

  // 2nd level

  type ExampleQJGO = TypesaurusGroups.GroupsLevel2<Schema1>

  type ResultQJGO = Assert<{}, ExampleQJGO>

  type ExampleUMAX = TypesaurusGroups.GroupsLevel2<Schema2>

  type ResultUMAX = Assert<
    | {
        comments: [Comment, 'books/comments']
        likes: [Like, 'books/likes']
      }
    | {
        comments: [OrderComment, 'orders/comments']
      },
    ExampleUMAX
  >

  type Example4JFS = TypesaurusGroups.GroupsLevel2<Schema3>

  type Result4JFS = Assert<
    | {
        comments: [Comment, 'books/comments']
        likes: [Like, 'books/likes']
      }
    | {
        comments: [OrderComment, 'orders/comments']
      },
    Example4JFS
  >

  // 3rd level

  type ExampleMAJN = TypesaurusGroups.GroupsLevel3<Schema1>

  type ResultMAJN = Assert<{}, ExampleMAJN>

  type ExampleWLYA = TypesaurusGroups.GroupsLevel3<Schema2>

  type ResultWLYA = Assert<{}, ExampleWLYA>

  type ExampleXNAT = TypesaurusGroups.GroupsLevel3<Schema3>

  type ResultXNAT = Assert<{ likes: Like } | {}, ExampleXNAT>

  // Groups

  // Root level

  type Example7DGC = TypesaurusGroups.Groups<Schema1>

  type Result7DGC = Assert<
    {
      books: TypesaurusGroups.Group<[Book, 'books']>
      orders: TypesaurusGroups.Group<[Order, 'orders']>
    },
    Example7DGC
  >

  // 2nd level

  type ExampleMIAM = TypesaurusGroups.Groups<Schema1>

  type ResultMIAM = Assert<
    {
      books: TypesaurusGroups.Group<[Book, 'books']>
      orders: TypesaurusGroups.Group<[Order, 'orders']>
    },
    ExampleMIAM
  >

  // 3rd level

  type ExampleM7US = TypesaurusGroups.Groups<Schema3>

  type ResultM7US = Assert<
    {
      books: TypesaurusGroups.Group<[Book, 'books']>
      comments: TypesaurusGroups.Group<
        [Comment, 'books/comments'] | [OrderComment, 'orders/comments']
      >
      likes: TypesaurusGroups.Group<
        [Like, 'books/likes'] | [Like, 'orders/comments/likes']
      >
      orders: TypesaurusGroups.Group<[Order, 'orders']>
    },
    ExampleM7US
  >

  // Functions

  groups(db1).books.all()

  groups(db2).comments.all()

  groups(db2).likes.all()

  groups(db3)
    .comments.all()
    .then((comments) => {
      const comment = comments[0]
      if (!comment) return

      // It's a book comment
      if ('text' in comment.data) {
        // @ts-expect-error: It's not possible in TypeScript ATM
        db3.books(db3.books.id('asd')).comments.get(comment.ref.id)
      }

      // It's order comment
      if ('rating' in comment.data) {
        // @ts-expect-error: It's not possible in TypeScript ATM
        db3.orders(db3.orders.id('asd')).comments.get(comment.ref.id)
      }
    })

  groups(db3).likes.all()
}

type Assert<Type1, _Type2 extends Type1> = true

function assert<Type>(arg: Type) {}

// interface Hello<Pair extends [any, any]> {
//   hello: Pair[0]
//   world: Pair[1]
// }

// type Asd = Hello<[string, 'hello!']> | Hello<[number, 'world!']>

interface Qwe<Hello, World> {
  hello: Hello
  world: World
}

type Asd = Qwe<string, 'hello!'> | Qwe<number, 'world!'>

const asd = {} as unknown as Asd

if (typeof asd.hello === 'string') {
  asd.world
}
