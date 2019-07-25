import assert from 'assert'
import { subcollection } from '.'
import { Ref, ref } from '../ref'
import { collection } from '../collection'

describe('Subcollection', () => {
  type User = { name: string }
  type Post = { author: Ref<User>; text: string; date?: Date }
  const users = collection<User>('users')

  describe('subcollection', () => {
    it('creates subcollection function', () => {
      const userRef = ref(users, '42')
      const userPosts = subcollection<Post, User>('posts', users)
      assert.deepEqual(userPosts(userRef), {
        __type__: 'collection',
        path: 'users/42/posts'
      })
    })
  })
})
