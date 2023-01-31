import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { TokenSecurity } from '@shared/models/tokens/token-security';

export interface Token extends BlockchainToken {
  image: string;
  rank: number;
  price: number;

  /**
   * Security information about token.
   * Equals `null` in case security information is not available.
   */
  tokenSecurity?: TokenSecurity | null;
}
