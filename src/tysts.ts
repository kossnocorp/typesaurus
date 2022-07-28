import type { Typesaurus } from '.'
import { schema } from './adaptor/admin'

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

type Asd = Record<string, number>

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
