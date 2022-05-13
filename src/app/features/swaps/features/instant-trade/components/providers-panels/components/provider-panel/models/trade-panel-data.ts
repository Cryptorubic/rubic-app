import BigNumber from 'bignumber.js';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface TradePanelData {
  blockchain: BlockchainName;
  amount: BigNumber;
  gasLimit: string;
  gasFeeInUsd: BigNumber;
  gasFeeInEth: BigNumber;
}
