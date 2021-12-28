import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

export interface Tokens extends BlockchainToken {
  image: string;
  rank: number;
  price: number;
  usedInIframe: boolean;
}
