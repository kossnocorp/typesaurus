// NOTE: That this file is used to generate tysts for different environments,
// including loose that is located next to this file (see ./loose/batch.ts).
// To do that, we use @tysts-start and @tysts-end comments.

// @tysts-start: strict
import { batch, schema, Typesaurus } from '..'
// @tysts-end: strict
/* @tysts-start: loose
import { batch, schema, Typesaurus } from '../..'
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

async function tysts() {
  const $ = batch(db)

  // @ts-expect-error - all the data is missing
  $.users.set(db.users.id('asd'), {})

  $.users.set(db.users.id('asd'), ($) => ({
    name: 'Sasha',
    contacts: {
      email: 'koss@nocorp.me'
    },
    birthdate: new Date(1987, 1, 11),
    createdAt: $.serverDate()
  }))

  $.users.update(db.users.id('asd'), {
    // @ts-expect-error
    ame: 'Alexander'
  })

  $.users.update(db.users.id('asd'), {
    name: 'Alexander'
  })

  $.users.update(db.users.id('asd'), {
    name: 'Alexander'
  })

  $.posts.remove(db.posts.id('123'))

  // Runtime environement

  // @ts-expect-error - created at must be a server date
  $.users.update(db.users.id('asd'), ($) => ({
    createdAt: new Date()
  }))

  $.users.update(db.users.id('asd'), ($) => ({
    createdAt: $.serverDate()
  }))

  const $server = batch(db, { as: 'server' })

  $server.users.update(db.users.id('asd'), ($) => ({
    createdAt: new Date()
  }))

  // Update constraints

  // Simple update

  $.users.update(db.users.id('user-id'), {
    name: 'Alexander'
  })

  // Update with helpers

  $.users.update(db.users.id('user-id'), ($) => ({
    name: 'Sasha',
    birthdate: $.remove(),
    createdAt: $.serverDate()
  }))

  $.posts.update(db.posts.id('post-id'), ($) => ({
    likes: $.increment(5),
    likeIds: $.arrayUnion('like-id')
  }))

  $.posts.update(db.posts.id('post-id'), ($) => ({
    likeIds: $.arrayRemove('like-id')
  }))

  // Enforce required fields

  // @tysts-start: strict
  // @ts-expect-error - name is required
  $.users.update(db.users.id('user-id'), ($) => ({
    name: $.remove()
  }))
  // @tysts-end: strict

  // @ts-expect-error - name is required
  $.users.update(db.users.id('sasha'), {
    name: undefined
  })

  // Works with nested fields

  $.users.update(db.users.id('sasha'), ($) => ({
    contacts: {
      email: 'koss@nocorp.me',
      phone: $.remove()
    }
  }))

  // @ts-expect-error - email is required
  $.users.update(db.users.id('sasha'), ($) => ({
    contacts: {
      email: $.remove()
    }
  }))

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Optional').set($.remove())
  )

  // Single field update

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('name').set('Alexander')
  )

  // Multiple fields update

  $.accounts.update(db.accounts.id('sasha'), ($) => [
    $.field('name').set('Alexander'),
    $.field('createdAt').set($.serverDate())
  ])

  // Nested fields

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('contacts', 'phone').set('+65xxxxxxxx')
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('contacts', 'phone')
      // @ts-expect-error - wrong type
      .set(6500000000)
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update because emergencyContacts can be undefined
    $.field('emergencyContacts', 'phone').set('+65xxxxxxxx')
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - emergencyContacts must have name and phone
    $.field('emergencyContacts').set({
      name: 'Sasha'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('emergencyContacts').set({
      name: 'Sasha',
      phone: '+65xxxxxxxx'
    })
  )

  // Deeply nested field corner cases

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required').set({
      hello: 'Hello!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required').set({
      hello: 'Hello!',
      world: 'World!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update without hello
    $.field('nested1Required', 'nested12Required').set({
      world: 'World!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - should not update because requried12 on nested1Optional is required
    $.field('nested1Optional', 'nested12Optional').set({
      hello: 'Hello!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - nested1Optional has required12, so can't update
    $.field('nested1Optional', 'nested12Optional').set({
      world: 'World!'
    })
  )

  // Updating variable collection

  const contentId = db.content.id('hello-world!')

  $.content.update(contentId, {
    public: true
  })

  $.content.update(contentId, ($) => $.field('public').set(true))

  $.content.update(contentId, {
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  $.content.update(contentId, ($) =>
    // @ts-expect-error - can't update non-shared variable model fields
    $.field('type').set('text')
  )

  // Nested fields with records

  const postId = Math.random().toString()

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters').set({ [postId]: { likes: 5 } })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId).set({ likes: 5 })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, 'likes').set($.increment(1))
  )
}
