import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeToken } from './BridgeToken';

export interface BridgeTrade {
  token: BridgeToken;
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  amount: BigNumber;
  toAddress: string;
  onTransactionHash?: (hash: string) => void;
}
