import BigNumber from 'bignumber.js';
import { BridgeToken } from './BridgeToken';
import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BridgeTrade {
  token: BridgeToken;
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  amount: BigNumber;
  toAddress: string;
  onTransactionHash?: (hash: string) => void;
}

export interface PolygonBridgeTrade extends BridgeTrade {
  isBurnt?: boolean;
  burnTransactionHash?: string;
}
