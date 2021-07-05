import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';

export interface Token extends BlockchainToken {
  image: string;
  rank: number;
  price: number;
  usedInIframe: boolean;
}
