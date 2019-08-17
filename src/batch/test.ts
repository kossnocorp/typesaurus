import assert from 'assert'
import { batch } from '.'
import { collection } from '../collection'
import { ref } from '../ref'
import nanoid from 'nanoid'
import get from '../get'
import set from '../set'

describe('batch', () => {
  type User = { name: string }
  const users = collection<User>('users')

  it('performs batch operations', async () => {
    const { set, commit } = batch()
    const id = nanoid()
    const sashaRef = ref(users, `${id}-sasha`)
    const tatiRef = ref(users, `${id}-tati`)
    const edRef = ref(users, `${id}-ed`)
    set(sashaRef, { name: 'Sasha' })
    set(tatiRef, { name: 'Tati' })
    set(edRef, { name: 'Ed' })
    await commit()
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef)
    ])
    assert(sasha.data.name === 'Sasha')
    assert(tati.data.name === 'Tati')
    assert(ed.data.name === 'Ed')
  })

  it('allows updating', async () => {
    const { update, commit } = batch()
    const id = nanoid()
    const sashaRef = ref(users, `${id}-sasha`)
    const tatiRef = ref(users, `${id}-tati`)
    const edRef = ref(users, `${id}-ed`)
    await Promise.all([
      set(sashaRef, { name: 'Sasha' }),
      set(tatiRef, { name: 'Tati' }),
      set(edRef, { name: 'Ed' })
    ])
    update(sashaRef, { name: 'Sasha Koss' })
    update(tatiRef, { name: 'Tati Shepeleva' })
    update(edRef, { name: 'Ed Tsech' })
    await commit()
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef)
    ])
    assert(sasha.data.name === 'Sasha Koss')
    assert(tati.data.name === 'Tati Shepeleva')
    assert(ed.data.name === 'Ed Tsech')
  })

  it('allows removing', async () => {
    const { remove, commit } = batch()
    const id = nanoid()
    const sashaRef = ref(users, `${id}-sasha`)
    const tatiRef = ref(users, `${id}-tati`)
    const edRef = ref(users, `${id}-ed`)
    await Promise.all([
      set(sashaRef, { name: 'Sasha' }),
      set(tatiRef, { name: 'Tati' }),
      set(edRef, { name: 'Ed' })
    ])
    remove(sashaRef)
    remove(tatiRef)
    remove(edRef)
    await commit()
    const [sasha, tati, ed] = await Promise.all([
      get(sashaRef),
      get(tatiRef),
      get(edRef)
    ])
    assert(!sasha)
    assert(!tati)
    assert(!ed)
  })
})
