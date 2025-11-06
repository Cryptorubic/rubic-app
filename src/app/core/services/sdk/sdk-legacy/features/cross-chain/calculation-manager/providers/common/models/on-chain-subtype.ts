import { OnChainTradeType } from '../../../../../on-chain/calculation-manager/models/on-chain-trade-type';

export interface OnChainSubtype {
  from: OnChainTradeType | undefined;
  to: OnChainTradeType | undefined;
}
