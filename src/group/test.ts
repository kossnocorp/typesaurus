import { group } from '.'
import assert from 'assert'
import { subcollection } from '../subcollection'
import { Ref } from '../ref'
import { collection } from '../collection'

describe('group', () => {
  type User = { name: string }
  type Company = { name: string; address: string }
  type Post = { author: Ref<User>; text: string; date?: Date }
  const users = collection<User>('users')
  const companies = collection<Company>('companies')

  describe('group', () => {
    it('creates collection group', () => {
      const posts = collection<Post>('posts')
      const userPosts = subcollection<Post, User>('posts', users)
      const companyPosts = subcollection<Post, User>('posts', companies)
      const allPosts = group('posts', [posts, userPosts, companyPosts])
      assert.deepEqual(allPosts, {
        __type__: 'collectionGroup',
        path: 'posts'
      })
    })
  })
})
