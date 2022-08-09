import { schema, Typesaurus } from '..'
import { batch } from '.'

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
  $.users.set('asd', {})

  $.users.set('asd', ($) => ({
    name: 'Sasha',
    contacts: {
      email: 'koss@nocorp.me'
    },
    birthdate: new Date(1987, 1, 11),
    createdAt: $.serverDate()
  }))

  $.users.update('asd', {
    // @ts-expect-error
    ame: 'Alexander'
  })

  $.users.update('asd', {
    name: 'Alexander'
  })

  $.users.update('asd', {
    name: 'Alexander'
  })

  $.posts.remove('123')

  // Runtime environement

  // @ts-expect-error - created at must be a server date
  $.users.update('asd', ($) => ({
    createdAt: new Date()
  }))

  $.users.update('asd', ($) => ({
    createdAt: $.serverDate()
  }))

  const $server = batch(db, { as: 'server' })

  $server.users.update('asd', ($) => ({
    createdAt: new Date()
  }))

  // Update constraints

  // Simple update

  $.users.update('user-id', {
    name: 'Alexander'
  })

  // Update with helpers

  $.users.update('user-id', ($) => ({
    name: 'Sasha',
    birthdate: $.remove(),
    createdAt: $.serverDate()
  }))

  $.posts.update('post-id', ($) => ({
    likes: $.increment(5),
    likeIds: $.arrayUnion('like-id')
  }))

  $.posts.update('post-id', ($) => ({
    likeIds: $.arrayRemove('like-id')
  }))

  // Enforce required fields

  // @ts-expect-error - name is required
  $.users.update('user-id', ($) => ({
    name: $.remove()
  }))

  // @ts-expect-error - name is required
  $.users.update('sasha', {
    name: undefined
  })

  // Works with nested fields

  $.users.update('sasha', ($) => ({
    contacts: {
      email: 'koss@nocorp.me',
      phone: $.remove()
    }
  }))

  // @ts-expect-error - email is required
  $.users.update('sasha', ($) => ({
    contacts: {
      email: $.remove()
    }
  }))

  $.accounts.update('sasha', ($) => $.field('nested1Optional', $.remove()))

  // Single field update

  $.accounts.update('sasha', ($) => $.field('name', 'Alexander'))

  // Multiple fields update

  $.accounts.update('sasha', ($) => [
    $.field('name', 'Alexander'),
    $.field('createdAt', $.serverDate())
  ])

  // Nested fields

  $.accounts.update('sasha', ($) => $.field('contacts', 'phone', '+65xxxxxxxx'))

  $.accounts.update('sasha', ($) =>
    // @ts-expect-error - wrong type
    $.field('contacts', 'phone', 6500000000)
  )

  $.accounts.update('sasha', ($) =>
    // @ts-expect-error - can't update because emergencyContacts can be undefined
    $.field('emergencyContacts', 'phone', '+65xxxxxxxx')
  )

  $.accounts.update('sasha', ($) =>
    // @ts-expect-error - emergencyContacts must have name and phone
    $.field('emergencyContacts', {
      name: 'Sasha'
    })
  )

  $.accounts.update('sasha', ($) =>
    $.field('emergencyContacts', {
      name: 'Sasha',
      phone: '+65xxxxxxxx'
    })
  )

  // Deeply nested field corner cases

  $.accounts.update('sasha', ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!'
    })
  )

  $.accounts.update('sasha', ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!',
      world: 'World!'
    })
  )

  $.accounts.update('sasha', ($) =>
    // @ts-expect-error - can't update without hello
    $.field('nested1Required', 'nested12Required', {
      world: 'World!'
    })
  )

  $.accounts.update('sasha', ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - should not update because requried12 on nested1Optional is required
      hello: 'Hello!'
    })
  )

  $.accounts.update('sasha', ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - nested1Optional has required12, so can't update
      world: 'World!'
    })
  )

  // Nested fields with records

  const postId = 'post-id'

  $.accounts.update('sasha', ($) =>
    $.field('counters', { [postId]: { likes: 5 } })
  )

  $.accounts.update('sasha', ($) => $.field('counters', postId, { likes: 5 }))

  $.accounts.update('sasha', ($) =>
    $.field('counters', postId, 'likes', $.increment(1))
  )
}
