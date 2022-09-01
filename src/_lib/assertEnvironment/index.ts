import type { Adaptor } from '../../adaptor'
import type { RuntimeEnvironment } from '../../types'

export function assertEnvironment(
  adaptor: Adaptor,
  environment: RuntimeEnvironment | undefined
) {
  const error = environmentError(adaptor, environment)
  if (error) throw error
}

export function environmentError(
  adaptor: Adaptor,
  environment: RuntimeEnvironment | undefined
) {
  if (environment && adaptor.environment !== environment)
    return new Error(`Expected ${environment} environment`)
}
