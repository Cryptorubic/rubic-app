import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface TradePanelData {
  blockchain: BLOCKCHAIN_NAME;
  amount: BigNumber;
  gasLimit: string;
  gasFeeInUsd: BigNumber;
  gasFeeInEth: BigNumber;
}
