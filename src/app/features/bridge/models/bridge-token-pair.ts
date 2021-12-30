import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

export interface BridgeToken extends BlockchainToken {
  minAmount: number;
  maxAmount: number;
}

export type BridgeTokensByBlockchain = {
  [blockchain in BLOCKCHAIN_NAME]?: BridgeToken;
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
