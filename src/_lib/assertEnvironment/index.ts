import type { Adaptor } from '../../adaptor'
import type { RuntimeEnvironment } from '../../adaptor/types'

export default function assertEnvironment(
  adaptor: Adaptor,
  environment: RuntimeEnvironment | undefined
) {
  if (environment && adaptor.environment !== environment)
    throw new Error(`Expected ${environment} environment`)
}
