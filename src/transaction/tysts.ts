import { schema, Typesaurus } from '..'
import { transaction } from '.'

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

const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>()
}))

async function tysts() {
  transaction(($) => $.execute(db.users).get('asd')).then(($) => {
    // Access transaction data
    $.data?.data.contacts.email

    $.execute(db.users).update('asd', {
      // @ts-expect-error
      ame: 'Alexander'
    })

    $.execute(db.users).update('asd', {
      name: 'Alexander'
    })

    $.execute(db.users).update('asd', {
      name: 'Alexander'
    })

    $.execute(db.posts).remove('123')
  })
}
