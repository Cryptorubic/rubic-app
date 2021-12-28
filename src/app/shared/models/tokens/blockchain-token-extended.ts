import { BlockchainToken } from 'src/app/shared/models/tokens/blockchain-token';

export interface BlockchainTokenExtended extends BlockchainToken {
  totalSupply?: string;
}
