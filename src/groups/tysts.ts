import { schema, groups, Typesaurus } from '..'
import type { TypesaurusGroups as Groups } from '../types/groups'
import type { TypesaurusCore as Core } from '../types/core'

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

interface Post {
  title: string
  text: string
  likeIds?: string[]
  likes?: number
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
    book: Typesaurus.Ref<Book, 'books'>
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

  type ExampleAQ30 = Groups.ExtractGroupModels<Schema1>

  type ResultAQ30 = Assert<
    {
      books: {
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }
      orders: {
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }
    },
    ExampleAQ30
  >

  type ExampleRVD2 = Groups.ExtractGroupModels<Schema3>

  type ResultRVD2 = Assert<
    {
      books: {
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }
      orders: {
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }
    },
    ExampleRVD2
  >

  // ConstructGroups

  type ExampleOSE7 = Groups.ConstructGroups<
    {
      books: {
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }
      comics: {
        Model: Comic
        Id: Core.Id<'comics'>
        WideModel: Comic
        Flags: string
      }
    },
    {
      books: {
        Model: Book
        Id: Core.Id<'archive/books'>
        WideModel: Book
        Flags: string
      }
      plants: {
        Model: Plant
        Id: Core.Id<'plants'>
        WideModel: Plant
        Flags: string
      }
    },
    {
      plants: {
        Model: Plant
        Id: Core.Id<'archive/plants'>
        WideModel: Plant
        Flags: string
      }
    }
  >

  type ResultOSE7 = Assert<
    {
      books: Groups.Group<
        | { Model: Book; Id: Core.Id<'books'>; WideModel: Book; Flags: string }
        | {
            Model: Book
            Id: Core.Id<'archive/books'>
            WideModel: Book
            Flags: string
          }
      >
      comics: Groups.Group<{
        Model: Comic
        Id: Core.Id<'comics'>
        WideModel: Comic
        Flags: string
      }>
      plants: Groups.Group<
        | {
            Model: Plant
            Id: Core.Id<'plants'>
            WideModel: Plant
            Flags: string
          }
        | {
            Model: Plant
            Id: Core.Id<'archive/plants'>
            WideModel: Plant
            Flags: string
          }
      >
    },
    ExampleOSE7
  >

  type ExampleFSPP = Groups.ConstructGroups<
    {
      books: {
        Model: Book
        Id: Core.Id<'orders/books'>
        WideModel: Book
        Flags: string
      }
      comics: {
        Model: Comic
        Id: Core.Id<'comics'>
        WideModel: Comic
        Flags: string
      }
    },
    {
      books: {
        Model: Book
        Id: Core.Id<'archive/books'>
        WideModel: Book
        Flags: string
      }
      plants: {
        Model: Plant
        Id: Core.Id<'archive/plants'>
        WideModel: Plant
        Flags: string
      }
    },
    Groups.ExtractGroupModels<Schema3>
  >

  type ResultFSPP = Assert<
    {
      books: Groups.Group<
        | { Model: Book; Id: Core.Id<'books'>; WideModel: Book; Flags: string }
        | {
            Model: Book
            Id: Core.Id<'archive/books'>
            WideModel: Book
            Flags: string
          }
        | {
            Model: Book
            Id: Core.Id<'orders/books'>
            WideModel: Book
            Flags: string
          }
      >
      orders: Groups.Group<{
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }>
      comics: Groups.Group<{
        Model: Comic
        Id: Core.Id<'comics'>
        WideModel: Comic
        Flags: string
      }>
      plants: Groups.Group<{
        Model: Plant
        Id: Core.Id<'archive/plants'>
        WideModel: Plant
        Flags: string
      }>
    },
    ExampleFSPP
  >

  type ExampleYHWG = Groups.ConstructGroups<
    {
      books: {
        Model: Book
        Id: Core.Id<'orders/books'>
        WideModel: Book
        Flags: string
      }
      comics: {
        Model: Comic
        Id: Core.Id<'comics'>
        WideModel: Comic
        Flags: string
      }
    },
    | {
        books: {
          Model: Book
          Id: Core.Id<'archive/books'>
          WideModel: Book
          Flags: string
        }
        plants: {
          Model: Plant
          Id: Core.Id<'archive/plants'>
          WideModel: Plant
          Flags: string
        }
      }
    | {},
    Groups.ExtractGroupModels<Schema3>
  >

  type ResultYHWG = Assert<
    {
      books: Groups.Group<
        | { Model: Book; Id: Core.Id<'books'>; WideModel: Book; Flags: string }
        | {
            Model: Book
            Id: Core.Id<'archive/books'>
            WideModel: Book
            Flags: string
          }
        | {
            Model: Book
            Id: Core.Id<'orders/books'>
            WideModel: Book
            Flags: string
          }
      >
      orders: Groups.Group<{
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }>
      comics: Groups.Group<{
        Model: Comic
        Id: Core.Id<'comics'>
        WideModel: Comic
        Flags: string
      }>
      plants: Groups.Group<{
        Model: Plant
        Id: Core.Id<'archive/plants'>
        WideModel: Plant
        Flags: string
      }>
    },
    ExampleYHWG
  >

  // GroupsLevel

  // Root level

  type Example1PWX = Groups.GroupsLevel1<Schema1>

  type Result1PWX = Assert<
    {
      books: {
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }
      orders: {
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }
    },
    Example1PWX
  >

  type ExampleCCR2 = Groups.GroupsLevel1<Schema2>

  type ResultCCR2 = Assert<
    {
      books: {
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }
      orders: {
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }
    },
    ExampleCCR2
  >

  type ExampleGQLP = Groups.GroupsLevel1<Schema3>

  type ResultGQLP = Assert<
    {
      books: {
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }
      orders: {
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }
    },
    ExampleGQLP
  >

  // 2nd level

  type ExampleQJGO = Groups.GroupsLevel2<Schema1>

  type ResultQJGO = Assert<{}, ExampleQJGO>

  type ExampleUMAX = Groups.GroupsLevel2<Schema2>

  type ResultUMAX = Assert<
    | {
        comments: {
          Model: Comment
          Id: Core.Id<'books/comments'>
          WideModel: Comment
          Flags: string
        }
        likes: {
          Model: Like
          Id: Core.Id<'books/likes'>
          WideModel: Like
          Flags: string
        }
      }
    | {
        comments: {
          Model: OrderComment
          Id: Core.Id<'orders/comments'>
          WideModel: OrderComment
          Flags: string
        }
      },
    ExampleUMAX
  >

  type Example4JFS = Groups.GroupsLevel2<Schema3>

  type Result4JFS = Assert<
    | {
        comments: {
          Model: Comment
          Id: Core.Id<'books/comments'>
          WideModel: Comment
          Flags: string
        }
        likes: {
          Model: Like
          Id: Core.Id<'books/likes'>
          WideModel: Like
          Flags: string
        }
      }
    | {
        comments: {
          Model: OrderComment
          Id: Core.Id<'orders/comments'>
          WideModel: OrderComment
          Flags: string
        }
      },
    Example4JFS
  >

  // 3rd level

  type ExampleMAJN = Groups.GroupsLevel3<Schema1>

  type ResultMAJN = Assert<{}, ExampleMAJN>

  type ExampleWLYA = Groups.GroupsLevel3<Schema2>

  type ResultWLYA = Assert<{}, ExampleWLYA>

  type ExampleXNAT = Groups.GroupsLevel3<Schema3>

  type ResultXNAT = Assert<{ likes: Like } | {}, ExampleXNAT>

  // Groups

  // Root level

  type Example7DGC = Groups.Groups<Schema1>

  type Result7DGC = Assert<
    {
      books: Groups.Group<{
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }>
      orders: Groups.Group<{
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }>
    },
    Example7DGC
  >

  // 2nd level

  type ExampleMIAM = Groups.Groups<Schema1>

  type ResultMIAM = Assert<
    {
      books: Groups.Group<{
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }>
      orders: Groups.Group<{
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }>
    },
    ExampleMIAM
  >

  // 3rd level

  type ExampleM7US = Groups.Groups<Schema3>

  type ResultM7US = Assert<
    {
      books: Groups.Group<{
        Model: Book
        Id: Core.Id<'books'>
        WideModel: Book
        Flags: string
      }>
      comments: Groups.Group<
        | {
            Model: Comment
            Id: Core.Id<'books/comments'>
            WideModel: Comment
            Flags: string
          }
        | {
            Model: OrderComment
            Id: Core.Id<'orders/comments'>
            WideModel: OrderComment
            Flags: string
          }
      >
      likes: Groups.Group<
        | {
            Model: Like
            Id: Core.Id<'books/likes'>
            WideModel: Like
            Flags: string
          }
        | {
            Model: Like
            Id: Core.Id<'orders/comments/likes'>
            WideModel: Like
            Flags: string
          }
      >
      orders: Groups.Group<{
        Model: Order
        Id: Core.Id<'orders'>
        WideModel: Order
        Flags: string
      }>
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
