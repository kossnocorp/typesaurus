// NOTE: That this file is used to generate tysts for different environments,
// including loose that is located next to this file (see ./loose/transaction.ts).
// To do that, we use @tysts-start and @tysts-end comments.

// @tysts-start: strict
import { schema, transaction, Typesaurus } from '..'
// @tysts-end: strict
/* @tysts-start: loose
import { schema, transaction, Typesaurus } from '../..'
@tysts-end: loose */

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

interface TextContent {
  type: 'text'
  text: string
  public?: boolean
}

interface ImageContent {
  type: 'image'
  src: string
  public?: boolean
}

const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>(),
  accounts: $.collection<Account>(),
  content: $.collection<[TextContent, ImageContent]>()
}))

type Schema = Typesaurus.Schema<typeof db>

async function tysts() {
  transaction(db)
    .read(($) => $.db.users.get(db.users.id('asd')))
    .write(($) => {
      // Access transaction data
      $.result?.data.contacts.email

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
      $.result?.upset
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
      $.result[0]?.data.contacts
      $.result[0]?.upset

      $.result[1]?.data.text
      $.result[1]?.upset
    })

  // Object

  transaction(db)
    .read(async ($) => ({
      user: await $.db.users.get(db.users.id('asd')),
      post: await $.db.posts.get(db.posts.id('qwe'))
    }))
    .write(($) => {
      $.result.user?.data.contacts
      $.result.user?.upset

      $.result.post?.data.text
      $.result.post?.upset
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
      $.result.hello.user?.data.contacts
      $.result.hello.user?.upset

      $.result.world[0]?.data.text
      $.result.world[0]?.upset
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
      $.result[0]?.data.birthdate
      $.result[1]?.data.title
    })

  // Runtime environement

  transaction(db)
    .read(($) => $.db.users.get(db.users.id('asd')))
    .write(($) => {
      if (!$.result) return

      // Allows to access environment
      if ($.result.props.environment === 'server') {
      }

      // Server dates are always defined
      $.result.data.createdAt.getDay()

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
      if (!$.result) return

      // @ts-expect-error
      if ($.result.environment === 'client') {
      }

      $.db.users.update(db.users.id('asd'), ($) => ({
        createdAt: new Date()
      }))
    })

  // Update constraints

  transaction(db)
    .read(($) => $.db.users.get(db.users.id('asd')))
    .write(($) => {
      if (!$.result) return

      // Simple update

      $.result.update({
        name: 'Alexander'
      })

      // Update with helpers

      $.result.update(($) => ({
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

      // @tysts-start: strict
      // @ts-expect-error - name is required
      $.result.update(db.users.id('sasha'), ($) => ({
        name: $.remove()
      }))
      // @tysts-end: strict

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

  // Variable collection update

  const contentId = db.content.id('asd')

  transaction(db)
    .read(($) => $.db.content.get(contentId))
    .write(($) => {
      if (!$.result) return

      // Can't update variable model shape without narrowing

      $.result.update({
        public: true
      })

      $.result.update(($) => $.field('public').set(true))

      $.result.update({
        // @ts-expect-error - can't update non-shared variable model fields
        type: 'text'
      })

      $.result.update(($) =>
        // @ts-expect-error - can't update non-shared variable model fields
        $.field('type').set('text')
      )

      // Narrowing

      const textContent = $.result.narrow<TextContent>(
        (data) => data.type === 'text' && data
      )

      if (textContent) {
        // @ts-expect-error - can't update - we narrowed down to text type
        textContent.update({ src: 'Nope' })

        textContent.update(($) =>
          // @ts-expect-error - can't update - we narrowed down to text type
          $.field('src').set('Nope')
        )

        textContent.update({ text: 'Yup' })

        textContent.update(($) => $.field('text').set('Yup'))

        // ...via ref:

        // @ts-expect-error - can't update - we narrowed down to text type
        textContent.ref.update({ src: 'Nope' })

        textContent.ref.update(($) =>
          // @ts-expect-error - can't update - we narrowed down to text type
          $.field('src').set('Nope')
        )

        textContent.ref.update({ text: 'Yup' })

        textContent.ref.update(($) => $.field('text').set('Yup'))
      }

      // ...via ref:

      $.result.ref.update({
        public: true
      })

      $.result.ref.update(($) => $.field('public').set(true))

      $.result.ref.update({
        // @ts-expect-error - can't update non-shared variable model fields
        type: 'text'
      })

      $.result.ref.update(($) =>
        // @ts-expect-error - can't update non-shared variable model fields
        $.field('type').set('text')
      )

      // ...via collection:

      $.db.content.update(contentId, {
        public: true
      })

      $.db.content.update(contentId, ($) => $.field('public').set(true))

      $.db.content.update(contentId, {
        // @ts-expect-error - can't update non-shared variable model fields
        type: 'text'
      })

      $.db.content.update(contentId, ($) =>
        // @ts-expect-error - can't update non-shared variable model fields
        $.field('type').set('text')
      )
    })

  // Result type

  type Result =
    | { state: 'yep'; user: Schema['users']['Doc'] }
    | { state: 'nope' }

  const result: Result = await transaction(db)
    .read(($) => $.db.users.get(db.users.id('asd')))
    .write(($) => {
      if (!$.result) return { state: 'nope' }
      // @ts-expect-error - write can't read
      $.result.get()
      return { state: 'yep', user: $.result }
    })

  if (result.state === 'yep') {
    await result.user.get()
  } else {
    // @ts-expect-error
    result.user
  }
}
