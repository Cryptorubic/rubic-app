import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';

export interface IToken extends BlockchainToken {
  image: string;
  rank: number;
  price: number;
  usedInIframe: boolean;
  userBalance?: number;
}
