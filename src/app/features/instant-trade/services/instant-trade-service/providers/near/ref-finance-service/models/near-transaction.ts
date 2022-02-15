import { RefFiFunctionCallOptions } from '@features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-function-calls';

export interface NearTransaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}
