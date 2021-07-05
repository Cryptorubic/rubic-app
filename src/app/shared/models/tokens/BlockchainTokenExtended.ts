import { BlockchainToken } from './BlockchainToken';

export interface BlockchainTokenExtended extends BlockchainToken {
  totalSupply?: string;
}
