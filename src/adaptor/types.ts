export type ServerTimestampsStrategy = 'estimate' | 'previous' | 'none'

export type DocumentDataOptions = {
  serverTimestamps?: ServerTimestampsStrategy
}

export type DocumentMetaData = {
  fromCache: boolean
  hasPendingWrites: boolean
}

export type RuntimeEnvironment = 'node' | 'web'
