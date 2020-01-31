import * as testing from '@firebase/testing'
import { injectAdaptor } from '../adaptor'
import { getAll } from '../adaptor/utils'

let currentApp: ReturnType<typeof testing.initializeTestApp>

export function injectTestingAdaptor() {
  app()
  injectAdaptor(
    // @ts-ignore: @firebase/testing and firebase-admin use different types
    // for Firestore so I had to disable the error. Find a way to make it right.
    () => {
      const firestore = currentApp.firestore()
      if (!('getAll' in firestore)) return Object.assign(firestore, { getAll })
      return firestore
    },
    {
      DocumentReference: testing.firestore.DocumentReference,
      Timestamp: testing.firestore.Timestamp,
      FieldValue: testing.firestore.FieldValue
    }
  )
}

export function app(userId: string | undefined = undefined) {
  currentApp = testing.initializeTestApp({
    projectId: 'project-id',
    auth: userId ? { uid: userId } : undefined
  })
}
