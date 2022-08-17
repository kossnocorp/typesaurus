import { group } from 'console'
import { Typesaurus } from '.'
import { schema } from './adapter/admin'
import { groups } from './adapter/admin/groups'

describe('Typesaurus core', () => {
  describe('DB', () => {
    describe('constructor', () => {
      it('creates a db instance', async () => {
        //

        // Flat schema
        const db = schema(($) => ({
          users: $.collection<User>(),
          posts: $.collection<Post>(),
          accounts: $.collection<Account>()
        }))

        // With subcollectios
        const nestedDB = schema(($) => ({
          users: $.collection<User>(),

          posts: $.collection<Post>().sub({
            comments: $.collection<Comment>().sub({
              likes: $.collection<Like>()
            }),

            likes: $.collection<PostLike>()
          }),

          updates: $.collection<Update>().sub({
            comments: $.collection<Comment>().sub({
              likes: $.collection<Like>()
            })
          })
        }))

        await groups(nestedDB).comments

        // Get all users
        await db.users.all()

        // Get a single document
        await db.users.get(db.users.id('sasha'))

        await db.users.add(($) => ({
          name: 'Sfg',
          contacts: {
            email: 'asd'
          },
          createdAt: $.serverDate()
        }))

        // Subcollections example
        await nestedDB
          .posts(nestedDB.posts.id('123'))
          .comments.get(
            nestedDB.posts(nestedDB.posts.id('123')).comments.id('comment-id')
          )

        // Get few documents by ids
        await db.users.many([
          db.users.id('sasha'),
          db.users.id('lesha'),
          db.users.id('tati')
        ])

        // NOTE: no await, it's a promise (?)
        const sashaPromise = db.users.get(db.users.id('sasha'))

        // 1. Get the document
        const sasha = await sashaPromise

        // 2. Subscribe to document
        const sashaUnsubscribe1 = sashaPromise
          .on((user) => {
            // Fresh user data
            user
          })
          .catch((error) => {
            // Do something with error
          })

        sashaUnsubscribe1()

        // Subscribe to a single document (real-time)
        const sashaUnsubscribe2 = db.users
          .get(db.users.id('sasha'))
          .on((user) => {
            // Fresh user data
            user
          })
          .catch((error) => {
            // Do something with error
          })

        sashaUnsubscribe2()

        db.users
          .many([
            db.users.id('sasha'),
            db.users.id('lesha'),
            db.users.id('tati')
          ])
          .on((users) => {
            // Fresh users data
          })

        interface User {
          name: string
          contacts: {
            email: string
          }
          // Allow setting only server date on client,
          // but allow on server
          createdAt: Typesaurus.ServerDate
        }

        // @ts-expect-error - createdDate is a server date
        await db.users.add(($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          createdAt: new Date()
        }))

        await db.users.add(($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          // Force server date, a Date triggers type error
          createdAt: $.serverDate()
        }))

        await db.users.add(
          {
            name: 'Sasha',
            contacts: { email: 'koss@nocorp.me' },
            // Allow setting date as we're on server.
            // See `as: 'server'` below
            createdAt: new Date()
          },
          { as: 'server' }
        )

        // Add a document
        db.posts.add({ title: 'Hello, world!', text: 'Hello!' })

        // Subcollections example
        await nestedDB
          .posts(nestedDB.posts.id('123'))
          .comments(nestedDB.posts(nestedDB.posts.id('123')).comments.id('qwe'))
          .likes.add({ userId: '123' })

        // Set the document
        db.posts.set(db.posts.id('doc-id'), {
          title: 'Hello, world!',
          text: 'Hello!'
        })

        // Update

        // upset, unlike update it will NOT trigger error
        // if the 'sasha` document don't exists.
        await db.users.upset(db.users.id('sasha'), ($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          createdAt: $.serverDate()
        }))

        // Remove
        await db.users.remove(db.users.id('sasha'))

        const addedUser = await db.users.add(($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          createdAt: $.serverDate()
        }))

        await addedUser.remove()

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

        await db.users.update(db.users.id('sasha'), () => ({ name: 'Sasha' }), {
          as: 'server'
        })

        const sashaRef = db.users.ref(db.users.id('sasha'))

        await sashaRef.remove()

        await sashaRef.update({ name: 'Sasha' })

        await groups(nestedDB).likes
      })
    })
  })
})

interface Post {
  title: string
  text: string
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
}
