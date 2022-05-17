import { RefPool } from '@features/swaps/core/instant-trade/providers/near/ref-finance-service/models/ref-pool';

export interface RefFinanceRoute {
  estimate: string;
  pool: RefPool;
}
