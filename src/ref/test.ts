import assert from 'assert'
import nanoid from 'nanoid'
import { getRefPath, ref, pathToRef } from '.'
import { collection } from '../collection'

describe('Ref', () => {
  const users = collection<User>('users')

  describe('ref', () => {
    it('creates ref object', () => {
      assert.deepEqual(ref(users, '42'), {
        __type__: 'ref',
        id: '42',
        collection: users
      })
    })
  })

  describe('getRefPath', () => {
    it('returns full document path', () => {
      assert(
        getRefPath({
          __type__: 'ref',
          id: '42',
          collection: users
        }) === 'users/42'
      )
    })
  })

  describe('getRefPath', () => {
    it('returns full document path', () => {
      assert(pathToRef('users/42'), {
        __type__: 'ref',
        id: '42',
        collection: users
      })
    })
  })

  // describe('setRef/getRef', () => {
  //   it('sets value to an item in collection with the given value', async () => {
  //     const id = nanoid()
  //     const userRef = ref(users, id)
  //     const userData = { name: 'Sasha' }
  //     await setRef(userRef, userData)
  //     const userFromDB = await getRef(userRef)
  //     assert.deepEqual(userFromDB.data, userData)
  //   })

  //   it('returns doc', async () => {
  //     const id = nanoid()
  //     const userRef = ref(users, id)
  //     const userData = { name: 'Sasha' }
  //     const userDoc = await setRef(userRef, userData)

  //     assert.deepEqual(userDoc, {
  //       __type__: 'doc',
  //       ref: userRef,
  //       data: userData
  //     })
  //   })
  // })

  // describe('deleteRef', () => {
  //   it('deletes existing document', async () => {
  //     const id = nanoid()
  //     const userRef = ref(users, id)
  //     const userData = { name: 'Sasha' }
  //     await setRef(userRef, userData)
  //     await deleteRef(userRef)

  //     const userItem = await getRef(userRef)
  //     assert(userItem === null)
  //   })
  // })
})

interface User {
  name: string
}
