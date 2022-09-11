import { schema, Typesaurus } from '.'
import type { TypesaurusCore as Core } from './types/core'
import type { TypesaurusUpdate as Update } from './types/update'
import type { TypesaurusUtils as Utils } from './types/utils'

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
      | {
          likes?: number
        }
      | undefined
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

// Flat schema
const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>(),
  accounts: $.collection<Account>(),
  organizations: $.collection<Organization>(),
  content: $.collection<[TextContent, ImageContent]>()
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

  const ads = user.environment

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

  // Adding to variable collection

  await db.content.add({
    type: 'text',
    text: 'Hello, world!'
  })

  await db.content.add({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await db.content.add({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })
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

  // Setting to variable collection

  const contentId = db.content.id('content-id')

  await db.content.set(contentId, {
    type: 'text',
    text: 'Hello, world!'
  })

  await db.content.set(contentId, {
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await db.content.set(contentId, {
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via ref

  const contentRef = db.content.ref(contentId)

  await contentRef.set({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentRef.set({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentRef.set({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via doc

  const contentDoc = await db.content.get(contentId)

  await contentDoc?.set({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentDoc?.set({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentDoc?.set({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
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

  // Upsetting to variable collection

  const contentId = db.content.id('content-id')

  await db.content.upset(contentId, {
    type: 'text',
    text: 'Hello, world!'
  })

  await db.content.upset(contentId, {
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await db.content.upset(contentId, {
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via ref

  const contentRef = db.content.ref(contentId)

  await contentRef.upset({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentRef.upset({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentRef.upset({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via doc

  const contentDoc = await db.content.get(contentId)

  await contentDoc?.upset({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentDoc?.upset({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentDoc?.upset({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
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

  // Updating to variable collectione

  const contentId = db.content.id('hello-world!')

  // Can't update variable model shape without narrowing

  db.content.update(contentId, {
    public: true
  })

  db.content.update(contentId, {
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  // Build Mode

  const collectionUpdate = db.content.update.build(contentId)

  collectionUpdate.field('public').set(true)

  // @ts-expect-error - can't update non-shared variable model fields
  collectionUpdate.field('type').set('text')

  // ...via doc

  const content = await db.content.get(contentId)

  content?.update({
    public: true
  })

  // @ts-expect-error - can't update non-shared variable model fields
  content?.update({
    type: 'text'
  })

  type Wut = TextContent | ImageContent extends TextContent | ImageContent
    ? 'yes'
    : 'nah'

  if (content?.reduce<TextContent>((data) => data.type === 'text' && data)) {
    // @ts-expect-error - can't update - we narrowed down to text type
    await content.update({ src: 'Nope' })

    await content.update({ text: 'Yup' })

    // type Q = boolean extends true ? 'yes' : 'no'
    // type C = true extends boolean ? 'yes' : 'no'

    const $ = content.update.build()

    // @ts-expect-error - can't update - we narrowed down to text type
    $.field('src').set('Nope')

    $.field('text').set('Ok')
  }

  type Asd = Utils.SharedShape2<TextContent, ImageContent>

  const docUpdate = content?.update.build()

  docUpdate?.field('public').set(true)

  // @ts-expect-error - can't update non-shared variable model fields
  docUpdate?.field('type').set('text')

  // ...via ref

  const contentRef = await db.content.ref(contentId)

  contentRef?.update({
    public: true
  })

  contentRef?.update({
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  const refUpdate = content?.update.build()

  refUpdate?.field('public').set(true)

  // @ts-expect-error - can't update non-shared variable model fields
  refUpdate?.field('type').set('text')
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
  type Schema1 = Core.InferSchema<typeof db>

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

  type Schema2 = Core.InferSchema<typeof nestedDB>

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

async function reduceDoc() {
  interface TwitterAccount {
    type: 'twitter'
    screenName: number
  }

  interface LinkedInAccount {
    type: 'linkedin'
    email: string
  }

  const db = schema(($) => ({
    accounts: $.collection<[TwitterAccount, LinkedInAccount]>()
  }))

  type Schema = Core.InferSchema<typeof db>

  type Result1 = Core.ReduceDoc<Schema['accounts']['Doc'], TwitterAccount>

  assertType<
    TypeEqual<
      Result1,
      Core.Doc<{
        Model: TwitterAccount
        Id: Core.Id<'accounts'>
        WideModel: [TwitterAccount, LinkedInAccount]
        Flags: { Reduced: true }
      }>
    >
  >(true)
}

namespace ModelData {
  // It does not mingle typed id

  type ResultOA8M = Core.ModelData<{
    helloId: Typesaurus.Id<'hello'>
  }>

  assertType<TypeEqual<ResultOA8M, { helloId: Typesaurus.Id<'hello'> }>>(true)
}

namespace ComposePath {
  type Result1 = Assert<'users', Utils.ComposePath<undefined, 'users'>>

  type Result2 = Assert<'users/posts', Utils.ComposePath<'users', 'posts'>>
}

namespace UnionKeys {
  type Example = { books: true } | { comics: true }

  type Result = Assert<'books' | 'comics', Utils.UnionKeys<Example>>
}

namespace UtilsTest {
  type Result1 = Assert<
    {
      required: string
      optional: string
    },
    Utils.AllRequired<{
      required: string
      optional?: string
    }>
  >

  type Result2 = Assert<
    {
      required: string
      optional: string
    },
    Utils.AllRequired<{
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

  type Result1 = Assert<true, Utils.RequiredKey<Example, 'required'>>

  type Result2 = Assert<false, Utils.RequiredKey<Example, 'optional'>>
}

namespace AllOptionalBut {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, Utils.AllOptionalBut<Example1, 'required'>>

  type Result2 = Assert<false, Utils.AllOptionalBut<Example1, 'optional'>>

  interface Example2 {
    required1: string
    required2: string
    optional?: string
  }

  type Result3 = Assert<false, Utils.AllOptionalBut<Example2, 'required1'>>

  type Result4 = Assert<false, Utils.AllOptionalBut<Example2, 'required2'>>

  type Result5 = Assert<false, Utils.AllOptionalBut<Example2, 'optional'>>

  interface Example3 {
    [postId: string]:
      | undefined
      | {
          likes?: string
          views?: string
        }
  }

  type Result6 = Assert<true, Utils.AllOptionalBut<Example3, 'post-id'>>

  interface Example4 {
    required: string
    [optional: string]: undefined | string
  }

  type Result7 = Assert<true, Utils.AllOptionalBut<Example4, 'required'>>
}

namespace RequiredPath {
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

  type Result4 = Assert<true, Utils.RequiredPath1<Example2, 'required'>>

  type Result7 = Assert<false, Utils.RequiredPath1<Example2, 'optional'>>

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<false, Utils.RequiredPath1<Example3, 'optional'>>

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
    Utils.RequiredPath2<Example4, 'required', 'required'>
  >

  type Result12 = Assert<
    false,
    Utils.RequiredPath2<Example4, 'required', 'optional'>
  >

  type Result14 = Assert<
    false,
    Utils.RequiredPath2<Example4, 'optional', 'required'>
  >

  type Result16 = Assert<
    false,
    Utils.RequiredPath2<Example4, 'optional', 'optional'>
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

  type Result18 = Assert<true, Utils.RequiredPath3<Example5, 1, 2, 3>>

  type Result19 = Assert<false, Utils.RequiredPath3<Example5, 1, 2, 'optional'>>

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

  type Result20 = Assert<true, Utils.RequiredPath4<Example6, 1, 2, 3, 4>>

  type Result21 = Assert<
    false,
    Utils.RequiredPath4<Example6, 1, 2, 3, 'optional'>
  >
}

namespace SafeOptionalPath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, Utils.SafeOptionalPath1<Example1, 'required'>>

  type Result2 = Assert<false, Utils.SafeOptionalPath1<Example1, 'optional'>>

  type Result3 = Assert<
    false,
    Utils.SafeOptionalPath1<
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
    Utils.SafeOptionalPath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    false,
    Utils.SafeOptionalPath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    false,
    Utils.SafeOptionalPath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    Utils.SafeOptionalPath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    true,
    Utils.SafeOptionalPath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    Utils.SafeOptionalPath2<Example3, 'optional', 'optional'>
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
    Utils.SafeOptionalPath3<Example4, 'required', 'required', 'required'>
  >

  type Result11 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'required', 'required', 'optional'>
  >

  type Result12 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'required', 'optional', 'required'>
  >

  type Result13 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'required', 'optional', 'optional'>
  >

  type Result14 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'required', 'required'>
  >

  type Result15 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'required', 'optional'>
  >

  type Result16 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'optional', 'required'>
  >

  type Result17 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'optional', 'optional'>
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
    Utils.SafeOptionalPath3<Example5, 'optional', 'optional', 'required'>
  >

  type Result19 = Assert<
    false,
    Utils.SafeOptionalPath3<Example5, 'optional', 'optional', 'optional'>
  >
}

namespace UtilsSafePath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, Utils.SafePath1<Example1, 'required'>>

  type Result2 = Assert<true, Utils.SafePath1<Example1, 'optional'>>

  type Result3 = Assert<
    true,
    Utils.SafePath1<
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

  type Result4 = Assert<true, Utils.SafePath2<Example2, 'required', 'required'>>

  type Result5 = Assert<true, Utils.SafePath2<Example2, 'required', 'optional'>>

  type Result6 = Assert<true, Utils.SafePath2<Example2, 'optional', 'required'>>

  type Result7 = Assert<
    false,
    Utils.SafePath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<true, Utils.SafePath2<Example3, 'optional', 'required'>>

  type Result9 = Assert<
    false,
    Utils.SafePath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    [postId: string]:
      | undefined
      | {
          likes?: number
          views?: number
        }
  }

  type Result10 = Assert<true, Utils.SafePath2<Example4, 'post-id', 'likes'>>

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
    Utils.SafePath3<Example5, 'required', 'required', 'required'>
  >

  type Result12 = Assert<
    true,
    Utils.SafePath3<Example5, 'required', 'required', 'optional'>
  >

  type Result13 = Assert<
    false,
    Utils.SafePath3<Example5, 'required', 'optional', 'required'>
  >

  type Result14 = Assert<
    false,
    Utils.SafePath3<Example5, 'required', 'optional', 'optional'>
  >

  type Result15 = Assert<
    true,
    Utils.SafePath3<Example5, 'optional', 'required', 'required'>
  >

  type Result16 = Assert<
    false,
    Utils.SafePath3<Example5, 'optional', 'required', 'optional'>
  >

  type Result17 = Assert<
    false,
    Utils.SafePath3<Example5, 'optional', 'optional', 'required'>
  >

  type Result18 = Assert<
    false,
    Utils.SafePath3<Example5, 'optional', 'optional', 'optional'>
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
    Utils.SafePath3<Example6, 'stats', 'post-id', 'likes'>
  >

  interface ExampleAY40 {
    required: {
      optional1?: {
        optional1?: string
        optional2?: string
      }
      optional2?: {
        optional?: string
        required: string
      }
    }
  }

  type ResultQP8V = Assert<
    true,
    Utils.SafePath3<ExampleAY40, 'required', 'optional1', 'optional1'>
  >

  type ResultAK3B = Assert<
    true,
    Utils.SafePath3<ExampleAY40, 'required', 'optional1', 'optional2'>
  >

  type ResultAXJR = Assert<
    false,
    Utils.SafePath3<ExampleAY40, 'required', 'optional2', 'optional'>
  >

  type Result92GA = Assert<
    true,
    Utils.SafePath3<ExampleAY40, 'required', 'optional2', 'required'>
  >

  interface ExampleLD18 {
    optional?: {
      optional1?: {
        optional1?: string
        optional2?: string
      }
      optional2?: {
        optional?: string
        required: string
      }
    }
  }

  type ResultA45H = Assert<
    true,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional1', 'optional1'>
  >

  type Result49SU = Assert<
    true,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional1', 'optional2'>
  >

  type ResultDM3H = Assert<
    false,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional2', 'optional'>
  >

  type ResultTJ32 = Assert<
    true,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional2', 'required'>
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

  type Result20 = Assert<true, Utils.SafePath4<Example7, 1, 2, 3, 'required'>>

  type Result21 = Assert<true, Utils.SafePath4<Example7, 1, 2, 3, 'optional'>>

  type Result22 = Assert<
    true,
    Utils.SafePath4<Example7, 'one', 2, 3, 'required'>
  >

  type Result23 = Assert<
    false,
    Utils.SafePath4<Example7, 'one', 2, 3, 'optional'>
  >

  type Result24 = Assert<
    false,
    Utils.SafePath4<Example7, 'uno', 2, 3, 'required'>
  >

  type Result25 = Assert<
    false,
    Utils.SafePath4<Example7, 'uno', 2, 3, 'optional'>
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
    Utils.SafePath4<Example8, 'stats', 'post-id', 'comment-id', 'likes'>
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

namespace SharedShape {
  type ResultOD83 = Utils.SharedShape<
    { a: string | number; b: string; c: boolean },
    {
      a: string
      b: string
    }
  >

  type Result43J3 = Assert<{ a: string; b: string }, ResultOD83>
}

type Assert<Type1, _Type2 extends Type1> = true

export function assertType<Type>(value: Type) {}

export type TypeEqual<T, U> = Exclude<T, U> extends never
  ? Exclude<U, T> extends never
    ? true
    : false
  : false

type OK =
  | {
      <Key1 extends keyof TextContent>(key: Key1): Update.FieldHelpers<
        TextContent,
        TextContent,
        Key1,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<TextContent>[Key1],
        Key2,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2],
        Key3,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<TextContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3],
        Key4,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<TextContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key5,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<TextContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key6,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<TextContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key7,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key8 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<TextContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never,
        key8: Utils.SafePath8<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8
        > extends true
          ? Key8
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7],
        Key8,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key8 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7],
        Key9 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<TextContent>[Key1]
                    >[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<TextContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never,
        key8: Utils.SafePath8<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8
        > extends true
          ? Key8
          : never,
        key9: Utils.SafePath9<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8,
          Key9
        > extends true
          ? Key9
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<TextContent>[Key1]
                    >[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8],
        Key9,
        void
      >
      <
        Key1 extends keyof TextContent,
        Key2 extends keyof Utils.AllRequired<TextContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<TextContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key8 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<TextContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7],
        Key9 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<TextContent>[Key1]
                    >[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8],
        Key10 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<
                        Utils.AllRequired<TextContent>[Key1]
                      >[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6]
            >[Key7]
          >[Key8]
        >[Key9]
      >(
        key1: Key1,
        key2: Utils.SafePath2<TextContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<TextContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<TextContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never,
        key8: Utils.SafePath8<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8
        > extends true
          ? Key8
          : never,
        key9: Utils.SafePath9<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8,
          Key9
        > extends true
          ? Key9
          : never,
        key10: Utils.SafePath10<
          TextContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8,
          Key9,
          Key10
        > extends true
          ? Key10
          : never
      ): Update.FieldHelpers<
        TextContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<
                        Utils.AllRequired<TextContent>[Key1]
                      >[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6]
            >[Key7]
          >[Key8]
        >[Key9],
        Key10,
        void
      >
    }
  | {
      <Key1 extends keyof ImageContent>(key: Key1): Update.FieldHelpers<
        ImageContent,
        ImageContent,
        Key1,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<ImageContent>[Key1],
        Key2,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2],
        Key3,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<ImageContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3],
        Key4,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<ImageContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key5,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<ImageContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key6,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<ImageContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key7,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key8 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<ImageContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never,
        key8: Utils.SafePath8<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8
        > extends true
          ? Key8
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7],
        Key8,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key8 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7],
        Key9 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<ImageContent>[Key1]
                    >[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<ImageContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never,
        key8: Utils.SafePath8<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8
        > extends true
          ? Key8
          : never,
        key9: Utils.SafePath9<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8,
          Key9
        > extends true
          ? Key9
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<ImageContent>[Key1]
                    >[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8],
        Key9,
        void
      >
      <
        Key1 extends keyof ImageContent,
        Key2 extends keyof Utils.AllRequired<ImageContent>[Key1],
        Key3 extends keyof Utils.AllRequired<
          Utils.AllRequired<ImageContent>[Key1]
        >[Key2],
        Key4 extends keyof Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
        >[Key3],
        Key5 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
          >[Key3]
        >[Key4],
        Key6 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5],
        Key7 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6],
        Key8 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<ImageContent>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7],
        Key9 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<ImageContent>[Key1]
                    >[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8],
        Key10 extends keyof Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<
                        Utils.AllRequired<ImageContent>[Key1]
                      >[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6]
            >[Key7]
          >[Key8]
        >[Key9]
      >(
        key1: Key1,
        key2: Utils.SafePath2<ImageContent, Key1, Key2> extends true
          ? Key2
          : never,
        key3: Utils.SafePath3<ImageContent, Key1, Key2, Key3> extends true
          ? Key3
          : never,
        key4: Utils.SafePath4<ImageContent, Key1, Key2, Key3, Key4> extends true
          ? Key4
          : never,
        key5: Utils.SafePath5<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5
        > extends true
          ? Key5
          : never,
        key6: Utils.SafePath6<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6
        > extends true
          ? Key6
          : never,
        key7: Utils.SafePath7<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7
        > extends true
          ? Key7
          : never,
        key8: Utils.SafePath8<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8
        > extends true
          ? Key8
          : never,
        key9: Utils.SafePath9<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8,
          Key9
        > extends true
          ? Key9
          : never,
        key10: Utils.SafePath10<
          ImageContent,
          Key1,
          Key2,
          Key3,
          Key4,
          Key5,
          Key6,
          Key7,
          Key8,
          Key9,
          Key10
        > extends true
          ? Key10
          : never
      ): Update.FieldHelpers<
        ImageContent,
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<
                      Utils.AllRequired<
                        Utils.AllRequired<ImageContent>[Key1]
                      >[Key2]
                    >[Key3]
                  >[Key4]
                >[Key5]
              >[Key6]
            >[Key7]
          >[Key8]
        >[Key9],
        Key10,
        void
      >
    }
