import { TronParameters } from '@cryptorubic/web3';

export interface TronBridgersTransactionData {
  functionName: string;
  options: {
    feeLimit: number;
    callValue: number;
  };
  parameter: TronParameters;
  to: string;
}
