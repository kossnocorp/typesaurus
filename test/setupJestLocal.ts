import { injectTestingAdaptor } from '../src/testing'
import * as testing from '@firebase/rules-unit-testing'

injectTestingAdaptor(testing.initializeAdminApp({ projectId: 'project-id' }))
injectTestingAdaptor(
  testing.initializeTestApp({
    projectId: 'project-id',
    auth: { uid: 'user-id' }
  })
)
