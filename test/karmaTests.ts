import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID
const apiKey = process.env.FIREBASE_API_KEY

if (!projectId || !apiKey)
  throw new Error('FIREBASE_PROJECT_ID and FIREBASE_API_KEY must be set')

initializeApp({ apiKey, projectId })

const db = getFirestore()
connectFirestoreEmulator(db, 'localhost', 8080)

require('../src/tests/add')
require('../src/tests/all')

// import firebase from 'firebase/app'
// import 'firebase/auth'
// import 'firebase/firestore'

// if (!projectId) throw new Error('FIREBASE_PROJECT_ID must be defined')
// if (!apiKey) throw new Error('FIREBASE_API_KEY must be defined')

// firebase.initializeApp()

// beforeAll(async () => {
//   const username = process.env.FIREBASE_USERNAME
//   const password = process.env.FIREBASE_PASSWORD
//   if (username && password)
//     return firebase.auth().signInWithEmailAndPassword(username, password)
// })

// const testsContext = require.context('../src/', true, /\/tests\.ts$/)
// testsContext.keys().forEach(testsContext)
