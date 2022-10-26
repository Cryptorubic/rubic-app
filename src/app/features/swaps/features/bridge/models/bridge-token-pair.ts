import { BlockchainName } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

export interface BridgeToken extends BlockchainToken {
  minAmount: number;
  maxAmount: number;
}

export type BridgeTokensByBlockchain = {
  [blockchain in BlockchainName]?: BridgeToken;
};

export interface BridgeTokenPair {
  symbol: string;
  image: string;
  rank: number;

  tokenByBlockchain: BridgeTokensByBlockchain;

  fromEthFee?: number;
  toEthFee?: number;

  used_in_iframe?: boolean;
}
