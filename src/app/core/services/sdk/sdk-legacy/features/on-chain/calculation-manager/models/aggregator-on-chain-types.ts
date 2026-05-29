import { EvmTransactionConfig, TronTransactionConfig } from '@cryptorubic/web3';
import { SuiTransactionConfig } from '../../../common/models/sui-web3-pure/sui-encode-config';

export interface EvmEncodedConfigAndToAmount {
  tx: EvmTransactionConfig;
  toAmount: string;
}

export interface TronEncodedConfigAndToAmount {
  tx: TronTransactionConfig;
  toAmount: string;
}

export interface SuiEncodedConfigAndToAmount {
  tx: SuiTransactionConfig;
  toAmount: string;
}
