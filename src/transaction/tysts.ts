import { schema, transaction, Typesaurus } from '..'

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
    .read(($) => $.db.users.get(db.users.id('asd')))
    .write(($) => {
      // Access transaction data
      $.data?.data.contacts.email

      // @ts-expect-error - all the data is missing
      $.db.users.set(db.users.id('asd'), {})

      $.db.users.set(db.users.id('asd'), ($) => ({
        name: 'Sasha',
        contacts: {
          email: 'koss@nocorp.me'
        },
        birthdate: new Date(1987, 1, 11),
        createdAt: $.serverDate()
      }))

      $.db.users.update(db.users.id('asd'), {
        // @ts-expect-error
        ame: 'Alexander'
      })

      $.db.users.update(db.users.id('asd'), {
        name: 'Alexander'
      })

      $.db.users.update(db.users.id('asd'), {
        name: 'Alexander'
      })

      $.db.posts.remove(db.posts.id('qwe'))
    })

  // Single doc read

  transaction(db)
    .read(async ($) => {
      const doc = await $.db.users.get(db.users.id('asd'))
      // @ts-expect-error
      doc?.upset
      return doc
    })
    .write(($) => {
      // Converts read doc to write doc
      $.data?.upset
    })

  // Array

  transaction(db)
    .read(async ($) =>
      Promise.all([
        $.db.users.get(db.users.id('asd')),
        $.db.posts.get(db.posts.id('qwe'))
      ])
    )
    .write(($) => {
      $.data[0]?.data.contacts
      $.data[0]?.upset

      $.data[1]?.data.text
      $.data[1]?.upset
    })

  // Object

  transaction(db)
    .read(async ($) => ({
      user: await $.db.users.get(db.users.id('asd')),
      post: await $.db.posts.get(db.posts.id('qwe'))
    }))
    .write(($) => {
      $.data.user?.data.contacts
      $.data.user?.upset

      $.data.post?.data.text
      $.data.post?.upset
    })

  // Deeply nested

  transaction(db)
    .read(async ($) => ({
      hello: {
        user: await $.db.users.get(db.users.id('asd'))
      },
      world: [await $.db.posts.get(db.posts.id('qwe'))]
    }))
    .write(($) => {
      $.data.hello.user?.data.contacts
      $.data.hello.user?.upset

      $.data.world[0]?.data.text
      $.data.world[0]?.upset
    })

  // Get multiple documents

  transaction(db)
    .read(($) =>
      Promise.all([
        $.db.users.get(db.users.id('asd')),
        $.db.posts.get(db.posts.id('qwe'))
      ])
    )
    .write(($) => {
      $.data[0]?.data.birthdate
      $.data[1]?.data.title
    })

  // Runtime environement

  transaction(db)
    .read(($) => $.db.users.get(db.users.id('asd')))
    .write(($) => {
      if (!$.data) return

      // Allows to access environment
      if ($.data.environment === 'server') {
      }

      // Server dates are always defined
      $.data.data.createdAt.getDay()

      // @ts-expect-error - created at must be a server date
      $.db.users.update(db.users.id('asd'), ($) => ({
        createdAt: new Date()
      }))

      $.db.users.update(db.users.id('asd'), ($) => ({
        createdAt: $.serverDate()
      }))
    })

  transaction(db, { as: 'server' })
    .read(($) => $.db.users.get(db.users.id('asd')))
    .write(($) => {
      if (!$.data) return

      // @ts-expect-error
      if ($.data.environment === 'client') {
      }

      $.db.users.update(db.users.id('asd'), ($) => ({
        createdAt: new Date()
      }))
    })

  // Update constraints

  transaction(db)
    .read(($) => $.db.users.get(db.users.id('asd')))
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

      $.db.posts.update(db.posts.id('qwe'), ($) => ({
        likes: $.increment(5),
        likeIds: $.arrayUnion('like-id')
      }))

      $.db.posts.update(db.posts.id('qwe'), ($) => ({
        likeIds: $.arrayRemove('like-id')
      }))

      // Enforce required fields

      // @ts-expect-error - name is required
      $.data.update(db.users.id('sasha'), ($) => ({
        name: $.remove()
      }))

      // @ts-expect-error - name is required
      $.db.users.update(db.users.id('sasha'), ($) => ({
        name: undefined
      }))

      // Works with nested fields

      $.db.users.update(db.users.id('sasha'), ($) => ({
        contacts: {
          email: 'koss@nocorp.me',
          phone: $.remove()
        }
      }))

      // @ts-expect-error - email is required
      $.db.users.update(db.users.id('sasha'), ($) => ({
        contacts: {
          email: $.remove()
        }
      }))

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('nested1Optional').set($.remove())
      )

      // Single field update

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('name').set('Alexander')
      )

      // Multiple fields update

      $.db.accounts.update(db.accounts.id('sasha'), ($) => [
        $.field('name').set('Alexander'),
        $.field('createdAt').set($.serverDate())
      ])

      // Nested fields

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('contacts', 'phone').set('+65xxxxxxxx')
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        // @ts-expect-error - wrong type
        $.field('contacts', 'phone').set(6500000000)
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        // @ts-expect-error - can't update because emergencyContacts can be undefined
        $.field('emergencyContacts', 'phone').set('+65xxxxxxxx')
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        // @ts-expect-error - emergencyContacts must have name and phone
        $.field('emergencyContacts').set({
          name: 'Sasha'
        })
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('emergencyContacts').set({
          name: 'Sasha',
          phone: '+65xxxxxxxx'
        })
      )

      // Deeply nested field corner cases

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('nested1Required', 'nested12Required').set({
          hello: 'Hello!'
        })
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('nested1Required', 'nested12Required').set({
          hello: 'Hello!',
          world: 'World!'
        })
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        // @ts-expect-error - can't update without hello
        $.field('nested1Required', 'nested12Required').set({
          world: 'World!'
        })
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        // @ts-expect-error - should not update because requried12 on nested1Optional is required
        $.field('nested1Optional', 'nested12Optional').set({
          hello: 'Hello!'
        })
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        // @ts-expect-error - nested1Optional has required12, so can't update
        $.field('nested1Optional', 'nested12Optional').set({
          world: 'World!'
        })
      )

      // Nested fields with records

      const postId = 'post-id'

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('counters').set({ [postId]: { likes: 5 } })
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('counters', postId).set({ likes: 5 })
      )

      $.db.accounts.update(db.accounts.id('sasha'), ($) =>
        $.field('counters', postId, 'likes').set($.increment(1))
      )
    })
}
