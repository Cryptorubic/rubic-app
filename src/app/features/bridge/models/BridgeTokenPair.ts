import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';

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
