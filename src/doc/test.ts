import assert from 'assert'
import { nanoid } from 'nanoid'
import { doc } from '.'
import { assertType } from '../../test/utils'
import { collection } from '../collection'
import { ref } from '../ref'
import { ServerDate } from '../value'

describe('Doc', () => {
  const users = collection<User>('users')
  const groups = collection<Group>('groups')

  describe('doc', () => {
    it('creates doc object', () => {
      const userRef = ref(users, nanoid())
      const createdAt = new Date() as ServerDate
      const birthday = new Date(1987, 1, 11)

      assert.deepEqual(
        doc(
          userRef,
          { name: 'Sasha', createdAt, birthday },
          { environment: 'node' }
        ),
        {
          __type__: 'doc',
          ref: userRef,
          data: { name: 'Sasha', createdAt, birthday }
        }
      )
    })

    it('considers that data from cache might have nulls instead of dates', () => {
      const user: User = {
        name: 'Sasha',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1987, 1, 11)
      }

      const nodeDoc = doc(ref(users, nanoid()), user, { environment: 'node' })
      assertType<Date>(nodeDoc.data.birthday)
      if (nodeDoc.environment === 'node') {
        assertType<Date>(nodeDoc.data.createdAt)
      }

      const webDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true
      })
      assertType<Date>(webDoc.data.birthday)
      assertType<Date | null>(webDoc.data.createdAt)

      if (!webDoc.fromCache) {
        assertType<Date>(webDoc.data.createdAt)
      }
    })

    it('considers serverTimestamps property', () => {
      const user: User = {
        name: 'Sasha',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1987, 1, 11)
      }

      const estimateDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'estimate'
      })
      assertType<Date>(estimateDoc.data.createdAt)

      const previousDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'previous'
      })
      assertType<Date | null>(previousDoc.data.createdAt)

      const noneDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'none'
      })
      assertType<Date | null>(noneDoc.data.createdAt)

      const noneButNoCachedDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: false,
        hasPendingWrites: true,
        serverTimestamps: 'none'
      })
      assertType<Date>(noneButNoCachedDoc.data.createdAt)
    })

    it('considers dates nested in arrays in objects', () => {
      const president: User = {
        name: 'Sasha',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1987, 1, 11)
      }

      const tati: User = {
        name: 'Tati',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1989, 6, 10)
      }

      const group: Group = {
        head: { president },
        members: [president, tati]
      }

      const nodeDoc = doc(ref(groups, nanoid()), group, { environment: 'node' })
      assertType<Date>(nodeDoc.data.head.president.birthday)
      assertType<Date>(nodeDoc.data.members[1]!.birthday)
      if (nodeDoc.environment === 'node') {
        assertType<Date>(nodeDoc.data.head.president.createdAt)
        assertType<Date>(nodeDoc.data.members[1]!.createdAt)
      }

      const webDoc = doc(ref(groups, nanoid()), group, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true
      })
      assertType<Date>(webDoc.data.head.president.birthday)
      assertType<Date | null>(webDoc.data.head.president.createdAt)

      assertType<Date>(webDoc.data.members[1]!.birthday)
      assertType<Date | null>(webDoc.data.members[1]!.createdAt)

      if (!webDoc.fromCache) {
        assertType<Date>(webDoc.data.head.president.createdAt)
        assertType<Date>(webDoc.data.members[1]!.createdAt)
      }

      const estimateDoc = doc(ref(groups, nanoid()), group, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'estimate'
      })
      assertType<Date>(estimateDoc.data.head.president.createdAt)
      assertType<Date>(estimateDoc.data.members[1]!.createdAt)
    })
  })
})

interface User {
  name: string
  createdAt: ServerDate
  updatedAt?: ServerDate
  birthday: Date
}

interface Group {
  head: { president: User }
  members: User[]
}
