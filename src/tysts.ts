import type { Typesaurus } from '.'
import { schema } from './adapter/admin'
import { TypesaurusUtils } from './utils'

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
  const user = db.users.doc(db.users.id('sasha'), {
    name: 'Sasha',
    contacts: {
      email: 'koss@nocorp.me'
    },
    createdAt: new Date() as Typesaurus.ServerDate
  })

  // Runtime environment

  if (user.environment === 'server') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.source === 'database') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.dateStrategy === 'estimate') {
    user.data.createdAt.getDay()
  } else if (user.dateStrategy === 'previous') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }
}

async function get() {
  const user = await db.users.get(db.users.id('sasha'))
  if (!user) return

  // Runtime environment

  if (user.environment === 'server') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.source === 'database') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.dateStrategy === 'estimate') {
    user.data.createdAt.getDay()
  } else if (user.dateStrategy === 'previous') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }
}

async function getMany() {
  const [user] = await db.users.getMany([db.users.id('sasha')])
  if (!user) return

  // Runtime environment

  if (user.environment === 'server') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.source === 'database') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.dateStrategy === 'estimate') {
    user.data.createdAt.getDay()
  } else if (user.dateStrategy === 'previous') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }
}

async function all() {
  const [user] = await db.users.all()
  if (!user) return

  // Runtime environment

  if (user.environment === 'server') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.source === 'database') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.dateStrategy === 'estimate') {
    user.data.createdAt.getDay()
  } else if (user.dateStrategy === 'previous') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }
}

async function query() {
  const [user] = await db.users.query(($) => $.where('name', '==', 'Sasha'))
  if (!user) return

  // Runtime environment

  if (user.environment === 'server') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.source === 'database') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.dateStrategy === 'estimate') {
    user.data.createdAt.getDay()
  } else if (user.dateStrategy === 'previous') {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Basic query

  await db.users.query(($) => [
    $.where('name', '==', 'Sasha'),
    // @ts-expect-error
    $.where(['contacts', 'emal'], '==', 'koss@nocorp.me'),
    $.order('name'),
    $.limit(1)
  ])

  // Subscription

  const offQuery = db.users
    .query(($) => [
      $.where('name', '==', 'Sasha'),
      $.where(['contacts', 'email'], '==', 'koss@nocorp.me'),
      $.order('name'),
      $.limit(1)
    ])
    .on((users) => {})
    .catch((error) => {})

  offQuery()

  // Nested fields

  await db.users.query(($) => [
    $.where(['contacts', 'email'], '==', 'koss@nocorp.me')
  ])

  // Optional path
  await db.accounts.query(($) => [
    $.where(['nested1Optional', 'nested12Optional', 'hello'], '==', 'World!')
  ])

  // where

  // in

  await db.accounts.query(($) => [
    $.where($.docId(), 'in', [db.accounts.id('id1'), db.accounts.id('id2')])
  ])

  await db.accounts.query(($) => [
    // @ts-expect-error - the value should be an array
    $.where($.docId(), 'in', 'id1')
  ])

  // array-contains

  await db.posts.query(($) => $.where('likeIds', 'array-contains', 'id1'))

  // @ts-expect-error - the value should be a string
  await db.posts.query(($) => $.where('likeIds', 'array-contains', 1))

  // order

  await db.accounts.query(($) => $.order($.docId()))

  await db.accounts.query(($) => $.order('contacts'))

  await db.accounts.query(($) => $.order(['contacts', 'email']))

  await db.accounts.query(($) => $.order(['contacts', 'phone']))

  // @ts-expect-error - nope is not a valid field
  await db.accounts.query(($) => $.order(['contacts', 'nope']))
}

async function update() {
  // Simple update

  await db.users.update(db.users.id('sasha'), {
    name: 'Alexander'
  })

  // Update with helpers

  await db.users.update(db.users.id('sasha'), ($) => ({
    name: 'Sasha',
    birthdate: $.remove(),
    createdAt: $.serverDate()
  }))

  await db.posts.update(db.posts.id('post-id'), ($) => ({
    likes: $.increment(5),
    likeIds: $.arrayUnion('like-id')
  }))

  await db.posts.update(db.posts.id('post-id'), ($) => ({
    likeIds: $.arrayRemove('like-id')
  }))

  // Enforce required fields

  // @ts-expect-error - name is required
  await db.users.update(db.users.id('sasha'), ($) => ({
    name: $.remove()
  }))

  // @ts-expect-error - name is required
  await db.users.update(db.users.id('sasha'), ($) => ({
    name: undefined
  }))

  // Works with nested fields

  await db.users.update(db.users.id('sasha'), ($) => ({
    contacts: {
      email: 'koss@nocorp.me',
      phone: $.remove()
    }
  }))

  // @ts-expect-error - email is required
  await db.users.update(db.users.id('sasha'), ($) => ({
    contacts: {
      email: $.remove()
    }
  }))

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Optional', $.remove())
  )

  // Single field update

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('name', 'Alexander')
  )

  // Multiple fields update

  await db.accounts.update(db.accounts.id('sasha'), ($) => [
    $.field('name', 'Alexander'),
    $.field('createdAt', $.serverDate())
  ])

  // Nested fields

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('contacts', 'phone', '+65xxxxxxxx')
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - wrong type
    $.field('contacts', 'phone', 6500000000)
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update because emergencyContacts can be undefined
    $.field('emergencyContacts', 'phone', '+65xxxxxxxx')
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - emergencyContacts must have name and phone
    $.field('emergencyContacts', {
      name: 'Sasha'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('emergencyContacts', {
      name: 'Sasha',
      phone: '+65xxxxxxxx'
    })
  )

  // Deeply nested field corner cases

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required', {
      hello: 'Hello!',
      world: 'World!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update without hello
    $.field('nested1Required', 'nested12Required', {
      world: 'World!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - should not update because requried12 on nested1Optional is required
      hello: 'Hello!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Optional', 'nested12Optional', {
      // @ts-expect-error - nested1Optional has required12, so can't update
      world: 'World!'
    })
  )

  // Nested fields with records

  const postId = 'post-id'

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', { [postId]: { likes: 5 } })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, { likes: 5 })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, 'likes', $.increment(1))
  )
}
