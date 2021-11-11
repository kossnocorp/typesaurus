import type { Adaptor } from '../../adaptor'
import type { RuntimeEnvironment } from '../../types'
export declare function assertEnvironment(
  adaptor: Adaptor,
  environment: RuntimeEnvironment | undefined
): void
export declare function environmentError(
  adaptor: Adaptor,
  environment: RuntimeEnvironment | undefined
): Error | undefined
