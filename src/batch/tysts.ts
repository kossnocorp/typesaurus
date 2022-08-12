import { schema, Typesaurus } from '..'
import { batch } from '.'
import { nanoid } from 'nanoid'

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

  // @ts-expect-error - name is required
  $.users.update(db.users.id('user-id'), ($) => ({
    name: $.remove()
  }))

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
    $.field('nested1Optional', $.remove())
  )

  // Single field update

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('name', 'Alexander')
  )

  // Multiple fields update

  $.accounts.update(db.accounts.id('sasha'), ($) => [
    $.field('name', 'Alexander'),
    $.field('createdAt', $.serverDate())
  ])

  // Nested fields

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('contacts', 'phone', '+65xxxxxxxx')
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - wrong type
    $.field('contacts', 'phone', 6500000000)
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update because emergencyContacts can be undefined
    $.field('emergencyContacts', 'phone', '+65xxxxxxxx')
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - emergencyContacts must have name and phone
    $.field('emergencyContacts', {
      name: 'Sasha'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('emergencyContacts', {
      name: 'Sasha',
      phone: '+65xxxxxxxx'
    })
  )

  // Deeply nested field corner cases

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!',
      world: 'World!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update without hello
    $.field('nested1Required', 'nested12Required', {
      world: 'World!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - should not update because requried12 on nested1Optional is required
      hello: 'Hello!'
    })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - nested1Optional has required12, so can't update
      world: 'World!'
    })
  )

  // Nested fields with records

  const postId = nanoid()

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', { [postId]: { likes: 5 } })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, { likes: 5 })
  )

  $.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, 'likes', $.increment(1))
  )
}
