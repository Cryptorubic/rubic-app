import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

interface BlockchainToken {
  address: string;
  name: string;
  symbol: string;
  decimal: number;

  minAmount: number;
  maxAmount: number;
}

export type BlockchainsTokens = {
  [blockchain in BLOCKCHAIN_NAME]: BlockchainToken;
};

export interface BridgeToken {
  symbol: string;
  image: string;

  blockchainToken: BlockchainsTokens;

  fromEthFee?: number;
  toEthFee?: number;
}
