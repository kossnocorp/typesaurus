import { initializeTestEnvironment } from '@firebase/rules-unit-testing'

jest.setTimeout(1000)

beforeAll(() => {
  return initializeTestEnvironment({
    projectId: 'project-id'
  })
})
