import { BridgersSourceFlag } from './bridgers-source-flag';

export interface BridgersUpdateDataAndStatusRequest {
  hash: string;
  fromTokenChain: string;
  sourceFlag: BridgersSourceFlag;
  fromTokenAddress?: string;
  toTokenAddress?: string;
  fromAddress?: string;
  toAddress?: string;
  toTokenChain?: string;
  fromTokenAmount?: string;
  amountOutMin?: string;
  fromCoinCode?: string;
  toCoinCode?: string;
}

export interface BridgersUpdateDataAndStatusResponse {
  data: {
    orderId?: string;
  };
}
