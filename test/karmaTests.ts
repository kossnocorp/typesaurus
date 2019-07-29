import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp({
  apiKey: 'AIzaSyD8t_V-4LH-EYTViDwtXLaBplon6QXm-Ck',
  projectId: 'storetype-test'
})

beforeAll(async () => {
  return firebase
    .auth()
    .signInWithEmailAndPassword(
      process.env.FIREBASE_USERNAME as string,
      process.env.FIREBASE_PASSWORD as string
    )
})

const testsContext = require.context('../src/', true, /\/test\.ts$/)
testsContext.keys().forEach(testsContext)
