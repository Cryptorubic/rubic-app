import InstantTrade from '@features/swaps/features/instant-trade/models/instant-trade';
import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface OneinchInstantTrade extends InstantTrade {
  blockchain: EthLikeBlockchainName;

  /**
   * Transaction data to send.
   * Equals `null` if data wasn't retrieved from api.
   */
  data: string | null;
}
