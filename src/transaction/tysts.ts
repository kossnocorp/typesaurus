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
  transaction(db)
    .read(($) => $.db.users.get('asd'))
    .write(($) => {
      // Access transaction data
      $.data?.data.contacts.email

      // @ts-expect-error - all the data is missing
      $.db.users.set('asd', {})

      $.db.users.set('asd', ($) => ({
        name: 'Sasha',
        contacts: {
          email: 'koss@nocorp.me'
        },
        birthdate: new Date(1987, 1, 11),
        createdAt: $.serverDate()
      }))

      $.db.users.update('asd', {
        // @ts-expect-error
        ame: 'Alexander'
      })

      $.db.users.update('asd', {
        name: 'Alexander'
      })

      $.db.users.update('asd', {
        name: 'Alexander'
      })

      $.db.posts.remove('123')
    })

  transaction(db)
    .read(($) => $.db.users.get('asd'))
    .write(($) => {
      // Access transaction data
      $.data?.data.contacts.email

      // @ts-expect-error - all the data is missing
      $.db.users.set('asd', {})

      $.db.users.set('asd', ($) => ({
        name: 'Sasha',
        contacts: {
          email: 'koss@nocorp.me'
        },
        birthdate: new Date(1987, 1, 11),
        createdAt: $.serverDate()
      }))

      $.db.users.update('asd', {
        // @ts-expect-error
        ame: 'Alexander'
      })

      $.db.users.update('asd', {
        name: 'Alexander'
      })

      $.db.users.update('asd', {
        name: 'Alexander'
      })

      $.db.posts.remove('123')
    })

  // Get multiple documents

  transaction(db)
    .read(($) => Promise.all([$.db.users.get('asd'), $.db.posts.get('asd')]))
    .write(($) => {
      $.data[0]?.data.birthdate
      $.data[1]?.data.title
    })

  // Runtime environement

  transaction(db)
    .read(($) => $.db.users.get('asd'))
    .write(($) => {
      if (!$.data) return

      // Allows to access environment
      if ($.data.environment === 'server') {
      }

      // Server dates are always defined
      $.data.data.createdAt.getDay()

      // @ts-expect-error - created at must be a server date
      $.db.users.update('asd', ($) => ({
        createdAt: new Date()
      }))

      $.db.users.update('asd', ($) => ({
        createdAt: $.serverDate()
      }))
    })

  transaction(db, { as: 'server' })
    .read(($) => $.db.users.get('asd'))
    .write(($) => {
      if (!$.data) return

      // @ts-expect-error
      if ($.data.environment === 'client') {
      }

      $.db.users.update('asd', ($) => ({
        createdAt: new Date()
      }))
    })

  // Update constraints

  transaction(db)
    .read(($) => $.db.users.get('asd'))
    .write(($) => {
      if (!$.data) return

      // Simple update

      $.data.update({
        name: 'Alexander'
      })

      // Update with helpers

      $.data.update(($) => ({
        name: 'Sasha',
        birthdate: $.remove(),
        createdAt: $.serverDate()
      }))

      $.db.posts.update('post-id', ($) => ({
        likes: $.increment(5),
        likeIds: $.arrayUnion('like-id')
      }))

      $.db.posts.update('post-id', ($) => ({
        likeIds: $.arrayRemove('like-id')
      }))

      // Enforce required fields

      // @ts-expect-error - name is required
      $.data.update('sasha', ($) => ({
        name: $.remove()
      }))

      // @ts-expect-error - name is required
      $.db.users.update('sasha', ($) => ({
        name: undefined
      }))

      // Works with nested fields

      $.db.users.update('sasha', ($) => ({
        contacts: {
          email: 'koss@nocorp.me',
          phone: $.remove()
        }
      }))

      // @ts-expect-error - email is required
      $.db.users.update('sasha', ($) => ({
        contacts: {
          email: $.remove()
        }
      }))

      $.db.accounts.update('sasha', ($) =>
        $.field('nested1Optional', $.remove())
      )

      // Single field update

      $.db.accounts.update('sasha', ($) => $.field('name', 'Alexander'))

      // Multiple fields update

      $.db.accounts.update('sasha', ($) => [
        $.field('name', 'Alexander'),
        $.field('createdAt', $.serverDate())
      ])

      // Nested fields

      $.db.accounts.update('sasha', ($) =>
        $.field('contacts', 'phone', '+65xxxxxxxx')
      )

      $.db.accounts.update('sasha', ($) =>
        // @ts-expect-error - wrong type
        $.field('contacts', 'phone', 6500000000)
      )

      $.db.accounts.update('sasha', ($) =>
        // @ts-expect-error - can't update because emergencyContacts can be undefined
        $.field('emergencyContacts', 'phone', '+65xxxxxxxx')
      )

      $.db.accounts.update('sasha', ($) =>
        // @ts-expect-error - emergencyContacts must have name and phone
        $.field('emergencyContacts', {
          name: 'Sasha'
        })
      )

      $.db.accounts.update('sasha', ($) =>
        $.field('emergencyContacts', {
          name: 'Sasha',
          phone: '+65xxxxxxxx'
        })
      )

      // Deeply nested field corner cases

      $.db.accounts.update('sasha', ($) =>
        $.field('nested1Required', 'nested12Required', {
          hello: 'Hello!'
        })
      )

      $.db.accounts.update('sasha', ($) =>
        $.field('nested1Required', 'nested12Required', {
          hello: 'Hello!',
          world: 'World!'
        })
      )

      $.db.accounts.update('sasha', ($) =>
        // @ts-expect-error - can't update without hello
        $.field('nested1Required', 'nested12Required', {
          world: 'World!'
        })
      )

      $.db.accounts.update('sasha', ($) =>
        $.field('nested1Optional', 'nested12Optional', {
          // @ts-expect-error - should not update because requried12 on nested1Optional is required
          hello: 'Hello!'
        })
      )

      $.db.accounts.update('sasha', ($) =>
        $.field('nested1Optional', 'nested12Optional', {
          // @ts-expect-error - nested1Optional has required12, so can't update
          world: 'World!'
        })
      )

      // Nested fields with records

      const postId = 'post-id'

      $.db.accounts.update('sasha', ($) =>
        $.field('counters', { [postId]: { likes: 5 } })
      )

      $.db.accounts.update('sasha', ($) =>
        $.field('counters', postId, { likes: 5 })
      )

      $.db.accounts.update('sasha', ($) =>
        $.field('counters', postId, 'likes', $.increment(1))
      )
    })
}
