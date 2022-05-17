import { RefFiFunctionCallOptions } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/ref-function-calls';

export interface NearTransaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}
