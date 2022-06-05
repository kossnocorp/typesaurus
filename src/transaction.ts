import { Typesaurus } from '.'
import { RuntimeEnvironment } from '../legacy'

export const transaction: Typesaurus.Transaction = () => {}
//  function transaction<
//   Environment extends Typesaurus.RuntimeEnvironment,
//   ReadResult,
//   WriteResult
// >(
//   readFunction: Typesaurus.TransactionReadFunction<Environment, ReadResult>,

//   writeFunction: Typesaurus.TransactionWriteFunction<
//     Environment,
//     ReadResult,
//     WriteResult
//   >,
//   options?: Typesaurus.OperationOptions<Environment>
// ): Promise<WriteResult> {}
