import { schema, Typesaurus } from '.'
import { TypesaurusCore } from './types/core'
import { TypesaurusUtils } from './types/utils'

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

interface Organization {
  counters?: {
    drafts: number
    scheduled: number
    published: number
  }
}

// Flat schema
const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>(),
  accounts: $.collection<Account>(),
  organizations: $.collection<Organization>()
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

  assertType<TypeEqual<typeof user.data.birthdate, Date | undefined | null>>(
    true
  )
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

async function many() {
  const [user] = await db.users.many([db.users.id('sasha')])
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

  // Simple query

  await db.users.all()
}

async function query() {
  const [user] = await db.users.query(($) => $.field('name').equal('Sasha'))
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
    $.field('name').equal('Sasha'),
    // @ts-expect-error
    $.field('contacts', 'emal').equal('koss@nocorp.me'),
    $.field('name').order(),
    $.limit(1)
  ])

  // Subscription

  const offQuery = db.users
    .query(($) => [
      $.field('name').equal('Sasha'),
      $.field('contacts', 'email').equal('koss@nocorp.me'),
      $.field('name').order(),
      $.limit(1)
    ])
    .on((users) => {})
    .catch((error) => {})

  offQuery()

  // Nested fields

  await db.users.query(($) => [
    $.field('contacts', 'email').equal('koss@nocorp.me')
  ])

  // Optional path
  await db.accounts.query(($) => [
    $.field('nested1Optional', 'nested12Optional', 'hello').equal('World!')
  ])

  // where

  // in

  await db.accounts.query(($) => [
    $.field($.docId()).in([db.accounts.id('id1'), db.accounts.id('id2')])
  ])

  await db.accounts.query(($) => [
    // @ts-expect-error - the value should be an array
    $.where($.docId(), 'in', 'id1')
  ])

  // array-contains

  await db.posts.query(($) => $.field('likeIds').contains('id1'))

  // @ts-expect-error - the value should be a string
  await db.posts.query(($) => $.field('likeIds').contains(1))

  // order

  await db.accounts.query(($) => $.field($.docId()).order())

  await db.accounts.query(($) => $.field('contacts').order())

  await db.accounts.query(($) => $.field('contacts', 'email').order())

  await db.accounts.query(($) => $.field('contacts', 'phone').order())

  // @ts-expect-error - nope is not a valid field
  await db.accounts.query(($) => $.field('contacts', 'nope').order())
}

async function set() {
  // Simple set

  db.posts.set(db.posts.id('doc-id'), {
    title: 'Hello, world!',
    text: 'Hello!'
  })

  // Set with helpers

  await db.users.set(db.users.id('sasha'), ($) => ({
    name: 'Sasha',
    contacts: { email: 'koss@nocorp.me' },
    createdAt: $.serverDate()
  }))

  await db.users.set(
    db.users.id('sasha'),
    {
      name: 'Sasha',
      contacts: { email: 'koss@nocorp.me' },
      createdAt: new Date()
    },
    { as: 'server' }
  )

  // Nullable fields

  db.posts.set(db.posts.id('doc-id'), {
    title: 'Hello, world!',
    text: 'Hello!',
    likes: null
  })
}

async function add() {
  // Simple add

  await db.posts.add({
    title: 'Hello, world!',
    text: 'Hello!'
  })

  // Upset with helpers

  await db.users.add(($) => ({
    name: 'Sasha',
    contacts: { email: 'koss@nocorp.me' },
    createdAt: $.serverDate()
  }))

  await db.users.add(
    {
      name: 'Sasha',
      contacts: { email: 'koss@nocorp.me' },
      createdAt: new Date()
    },
    { as: 'server' }
  )

  // Nullable fields

  db.posts.add({
    title: 'Hello, world!',
    text: 'Hello!',
    likes: null
  })
}

async function upset() {
  // Simple set

  db.posts.upset(db.posts.id('doc-id'), {
    title: 'Hello, world!',
    text: 'Hello!'
  })

  // Upset with helpers

  await db.users.upset(db.users.id('sasha'), ($) => ({
    name: 'Sasha',
    contacts: { email: 'koss@nocorp.me' },
    createdAt: $.serverDate()
  }))

  await db.users.upset(
    db.users.id('sasha'),
    {
      name: 'Sasha',
      contacts: { email: 'koss@nocorp.me' },
      createdAt: new Date()
    },
    { as: 'server' }
  )

  // Nullable fields

  db.posts.upset(db.posts.id('doc-id'), {
    title: 'Hello, world!',
    text: 'Hello!',
    likes: null
  })
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
    $.field('nested1Optional').set($.remove())
  )

  // Single field update

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('name').set('Alexander')
  )

  // Multiple fields update

  await db.accounts.update(db.accounts.id('sasha'), ($) => [
    $.field('name').set('Alexander'),
    $.field('createdAt').set($.serverDate())
  ])

  // Nested fields

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('contacts', 'phone').set('+65xxxxxxxx')
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - wrong type
    $.field('contacts', 'phone').set(6500000000)
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update because emergencyContacts can be undefined
    $.field('emergencyContacts', 'phone').set('+65xxxxxxxx')
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - emergencyContacts must have name and phone
    $.field('emergencyContacts').set({ name: 'Sasha' })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('emergencyContacts').set({
      name: 'Sasha',
      phone: '+65xxxxxxxx'
    })
  )

  // Deeply nested field corner cases

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required').set({
      hello: 'Hello!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required').set({
      hello: 'Hello!',
      world: 'World!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update without hello
    $.field('nested1Required', 'nested12Required').set({
      world: 'World!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - should not update because requried12 on nested1Optional is required
    $.field('nested1Optional', 'nested12Optional').set({ hello: 'Hello!' })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - nested1Optional has required12, so can't update
    $.field('nested1Optional', 'nested12Optional').set({
      world: 'World!'
    })
  )

  // Nested fields with records

  const postId = 'post-id'

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters').set({ [postId]: { likes: 5 } })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId).set({ likes: 5 })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, 'likes').set($.increment(1))
  )

  // Nullable fields

  db.posts.update(db.posts.id('doc-id'), {
    likes: null
  })

  db.posts.update(db.posts.id('doc-id'), ($) => $.field('likes').set(null))

  // Increment on nested optional values

  db.organizations.update(db.organizations.id('org-id'), ($) => ({
    counters: {
      drafts: $.increment(0),
      scheduled: $.increment(1),
      published: $.increment(0)
    }
  }))

  db.organizations.update(db.organizations.id('org-id'), ($) =>
    $.field('counters').set({
      drafts: $.increment(0),
      scheduled: $.increment(1),
      published: $.increment(0)
    })
  )
}

async function sharedIds() {
  interface Settings {
    email: string
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    settings: $.collection<Settings, Typesaurus.Id<'users'>>()
  }))

  const userId = await db.users.id()

  db.settings.update(userId, { email: 'hello@example.com' })
}

async function inferSchema() {
  type Schema1 = TypesaurusCore.InferSchema<typeof db>

  assertType<TypeEqual<Schema1['users']['Id'], Typesaurus.Id<'users'>>>(true)
  assertType<TypeEqual<Schema1['users']['Ref'], Typesaurus.Ref<User, 'users'>>>(
    true
  )
  assertType<TypeEqual<Schema1['users']['Doc'], Typesaurus.Doc<User, 'users'>>>(
    true
  )

  interface Settings {
    email: string
  }

  const nestedDB = schema(($) => ({
    users: $.collection<User>().sub({
      settings: $.collection<Settings>()
    })
  }))

  type Schema2 = TypesaurusCore.InferSchema<typeof nestedDB>

  assertType<
    TypeEqual<
      Schema2['users']['settings']['Id'],
      Typesaurus.Id<'users/settings'>
    >
  >(true)

  assertType<
    TypeEqual<
      Schema2['users']['settings']['Ref'],
      Typesaurus.Ref<Settings, 'users/settings'>
    >
  >(true)

  assertType<
    TypeEqual<
      Schema2['users']['settings']['Doc'],
      Typesaurus.Doc<Settings, 'users/settings'>
    >
  >(true)
}

async function narrowDoc() {
  interface TwitterAccount {
    type: 'twitter'
    screenName: number
  }

  interface LinkedInAccount {
    type: 'linkedin'
    email: string
  }

  const db = schema(($) => ({
    accounts: $.collection<TwitterAccount | LinkedInAccount>()
  }))

  type Schema = TypesaurusCore.InferSchema<typeof db>

  type Result1 = TypesaurusCore.NarrowDoc<
    Schema['accounts']['Doc'],
    TwitterAccount
  >

  assertType<TypeEqual<Result1, Typesaurus.Doc<TwitterAccount, 'accounts'>>>(
    true
  )
}

namespace ComposePath {
  type Result1 = Assert<
    'users',
    TypesaurusUtils.ComposePath<undefined, 'users'>
  >

  type Result2 = Assert<
    'users/posts',
    TypesaurusUtils.ComposePath<'users', 'posts'>
  >
}

namespace UnionKeys {
  type Example = { books: true } | { comics: true }

  type Result = Assert<'books' | 'comics', TypesaurusUtils.UnionKeys<Example>>
}

namespace AllRequired {
  type Result1 = Assert<
    {
      required: string
      optional: string
    },
    TypesaurusUtils.AllRequired<{
      required: string
      optional?: string
    }>
  >

  type Result2 = Assert<
    {
      required: string
      optional: string
    },
    TypesaurusUtils.AllRequired<{
      required: string
      optional?: string | undefined
    }>
  >
}

namespace RequiredKey {
  interface Example {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, TypesaurusUtils.RequiredKey<Example, 'required'>>

  type Result2 = Assert<false, TypesaurusUtils.RequiredKey<Example, 'optional'>>
}

namespace AllOptionalBut {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<
    true,
    TypesaurusUtils.AllOptionalBut<Example1, 'required'>
  >

  type Result2 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example1, 'optional'>
  >

  interface Example2 {
    required1: string
    required2: string
    optional?: string
  }

  type Result3 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example2, 'required1'>
  >

  type Result4 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example2, 'required2'>
  >

  type Result5 = Assert<
    false,
    TypesaurusUtils.AllOptionalBut<Example2, 'optional'>
  >

  interface Example3 {
    [postId: string]:
      | undefined
      | {
          likes?: string
          views?: string
        }
  }

  type Result6 = Assert<
    true,
    TypesaurusUtils.AllOptionalBut<Example3, 'post-id'>
  >

  interface Example4 {
    required: string
    [optional: string]: undefined | string
  }

  type Result7 = Assert<
    true,
    TypesaurusUtils.AllOptionalBut<Example4, 'required'>
  >
}

namespace RequiredPath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<
    true,
    TypesaurusUtils.RequiredPath1<Example1, 'required'>
  >

  type Result2 = Assert<
    true,
    TypesaurusUtils.RequiredPath1<Example1, 'optional'>
  >

  type Result3 = Assert<
    true,
    TypesaurusUtils.RequiredPath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<
    true,
    TypesaurusUtils.RequiredPath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    true,
    TypesaurusUtils.RequiredPath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    TypesaurusUtils.RequiredPath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result10 = Assert<
    true,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'required', 'required'>
  >

  type Result11 = Assert<
    true,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'required', 'optional'>
  >

  type Result12 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'optional', 'required'>
  >

  type Result13 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'required', 'optional', 'optional'>
  >

  type Result14 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'required', 'required'>
  >

  type Result15 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'required', 'optional'>
  >

  type Result16 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'optional', 'required'>
  >

  type Result17 = Assert<
    false,
    TypesaurusUtils.RequiredPath3<Example4, 'optional', 'optional', 'optional'>
  >

  interface Example5 {
    1: {
      2: {
        3: {
          4: true
        }
        optional?: {
          4: true
        }
      }
    }
  }

  type Result18 = Assert<
    true,
    TypesaurusUtils.RequiredPath4<Example5, 1, 2, 3, 4>
  >

  type Result19 = Assert<
    false,
    TypesaurusUtils.RequiredPath4<Example5, 1, 2, 'optional', 4>
  >

  interface Example6 {
    1: {
      2: {
        3: {
          4: {
            5: true
          }
          optional?: {
            5: true
          }
        }
      }
    }
  }

  type Result20 = Assert<
    true,
    TypesaurusUtils.RequiredPath5<Example6, 1, 2, 3, 4, 5>
  >

  type Result21 = Assert<
    false,
    TypesaurusUtils.RequiredPath5<Example6, 1, 2, 3, 'optional', 5>
  >
}

namespace SafeOptionalPath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath1<Example1, 'required'>
  >

  type Result2 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath1<Example1, 'optional'>
  >

  type Result3 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result10 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'required',
      'required'
    >
  >

  type Result11 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'required',
      'optional'
    >
  >

  type Result12 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'optional',
      'required'
    >
  >

  type Result13 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'required',
      'optional',
      'optional'
    >
  >

  type Result14 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'required',
      'required'
    >
  >

  type Result15 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'required',
      'optional'
    >
  >

  type Result16 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'optional',
      'required'
    >
  >

  type Result17 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example4,
      'optional',
      'optional',
      'optional'
    >
  >

  interface Example5 {
    optional?: {
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result18 = Assert<
    true,
    TypesaurusUtils.SafeOptionalPath3<
      Example5,
      'optional',
      'optional',
      'required'
    >
  >

  type Result19 = Assert<
    false,
    TypesaurusUtils.SafeOptionalPath3<
      Example5,
      'optional',
      'optional',
      'optional'
    >
  >
}

namespace SafePath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, TypesaurusUtils.SafePath1<Example1, 'required'>>

  type Result2 = Assert<true, TypesaurusUtils.SafePath1<Example1, 'optional'>>

  type Result3 = Assert<
    true,
    TypesaurusUtils.SafePath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    TypesaurusUtils.SafePath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    TypesaurusUtils.SafePath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    [postId: string]:
      | undefined
      | {
          likes?: number
          views?: number
        }
  }

  type Result10 = Assert<
    true,
    TypesaurusUtils.SafePath2<Example4, 'post-id', 'likes'>
  >

  interface Example5 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result11 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'required', 'required', 'required'>
  >

  type Result12 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'required', 'required', 'optional'>
  >

  type Result13 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'required', 'optional', 'required'>
  >

  type Result14 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'required', 'optional', 'optional'>
  >

  type Result15 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'required', 'required'>
  >

  type Result16 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'required', 'optional'>
  >

  type Result17 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'optional', 'required'>
  >

  type Result18 = Assert<
    false,
    TypesaurusUtils.SafePath3<Example5, 'optional', 'optional', 'optional'>
  >

  interface Example6 {
    stats?: {
      [postId: string]:
        | undefined
        | {
            likes?: number
            views?: number
          }
    }
  }

  type Result19 = Assert<
    true,
    TypesaurusUtils.SafePath3<Example6, 'stats', 'post-id', 'likes'>
  >

  interface Example7 {
    1: {
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }

    one?: {
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }

    uno?: {
      dos: string
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }
  }

  type Result20 = Assert<
    true,
    TypesaurusUtils.SafePath4<Example7, 1, 2, 3, 'required'>
  >

  type Result21 = Assert<
    true,
    TypesaurusUtils.SafePath4<Example7, 1, 2, 3, 'optional'>
  >

  type Result22 = Assert<
    true,
    TypesaurusUtils.SafePath4<Example7, 'one', 2, 3, 'required'>
  >

  type Result23 = Assert<
    false,
    TypesaurusUtils.SafePath4<Example7, 'one', 2, 3, 'optional'>
  >

  type Result24 = Assert<
    false,
    TypesaurusUtils.SafePath4<Example7, 'uno', 2, 3, 'required'>
  >

  type Result25 = Assert<
    false,
    TypesaurusUtils.SafePath4<Example7, 'uno', 2, 3, 'optional'>
  >

  interface Example8 {
    stats?: {
      [postId: string]:
        | undefined
        | {
            [commentId: string]:
              | undefined
              | {
                  likes?: number
                  views?: number
                }
          }
    }
  }

  type Result26 = Assert<
    true,
    TypesaurusUtils.SafePath4<
      Example8,
      'stats',
      'post-id',
      'comment-id',
      'likes'
    >
  >

  /*
  interface Example6 {
    1: {
      2: {
        3: {
          4: {
            required: string
            optional?: string
          }
        }
      }
    }
  }

  type Result18 = Assert<
    true,
    TypesaurusUtils.SafePath5<Example6, 1, 2, 3, 4, 'required'>
  >

  type Result19 = Assert<
    false,
    TypesaurusUtils.SafePath5<Example6, 1, 2, 3, 4, 'optional'>
  >

  interface Example7 {
    1: {
      2: {
        3: {
          4: {
            5: {
              required: string
              optional?: string
            }
          }
        }
      }
    }
  }

  type Result20 = Assert<
    true,
    TypesaurusUtils.SafePath6<Example7, 1, 2, 3, 4, 5, 'required'>
  >

  type Result21 = Assert<
    false,
    TypesaurusUtils.SafePath6<Example7, 1, 2, 3, 4, 5, 'optional'>
  >

  interface Example8 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                required: string
                optional?: string
              }
            }
          }
        }
      }
    }
  }

  type Result22 = Assert<
    true,
    TypesaurusUtils.SafePath7<Example8, 1, 2, 3, 4, 5, 6, 'required'>
  >

  type Result23 = Assert<
    false,
    TypesaurusUtils.SafePath7<Example8, 1, 2, 3, 4, 5, 6, 'optional'>
  >

  interface Example9 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                7: {
                  required: string
                  optional?: string
                }
              }
            }
          }
        }
      }
    }
  }

  type Result24 = Assert<
    true,
    TypesaurusUtils.SafePath8<Example9, 1, 2, 3, 4, 5, 6, 7, 'required'>
  >

  type Result25 = Assert<
    false,
    TypesaurusUtils.SafePath8<Example9, 1, 2, 3, 4, 5, 6, 7, 'optional'>
  >

  interface Example10 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                7: {
                  8: {
                    required: string
                    optional?: string
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  type Result26 = Assert<
    true,
    TypesaurusUtils.SafePath9<Example10, 1, 2, 3, 4, 5, 6, 7, 8, 'required'>
  >

  type Result27 = Assert<
    false,
    TypesaurusUtils.SafePath9<Example10, 1, 2, 3, 4, 5, 6, 7, 8, 'optional'>
  >

  interface Example11 {
    1: {
      2: {
        3: {
          4: {
            5: {
              6: {
                7: {
                  8: {
                    9: {
                      required: string
                      optional?: string
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  type Result28 = Assert<
    true,
    TypesaurusUtils.SafePath10<Example11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'required'>
  >

  type Result29 = Assert<
    false,
    TypesaurusUtils.SafePath10<Example11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'optional'>
  > */
}

type Assert<Type1, _Type2 extends Type1> = true

export function assertType<Type>(value: Type) {}

export type TypeEqual<T, U> = Exclude<T, U> extends never
  ? Exclude<U, T> extends never
    ? true
    : false
  : false
