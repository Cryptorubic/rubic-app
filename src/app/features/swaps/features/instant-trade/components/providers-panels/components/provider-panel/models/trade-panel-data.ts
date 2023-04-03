import BigNumber from 'bignumber.js';
import { BlockchainName } from 'rubic-sdk';

export interface TradePanelData {
  blockchain: BlockchainName;
  amount: BigNumber;
  gasLimit?: string;
  gasFeeInUsd?: BigNumber;
  gasFeeInEth?: BigNumber;
  showGas?: boolean;
  image?: string;
  hasError?: boolean;
}
