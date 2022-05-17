import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@features/swaps/shared/models/instant-trade-provider';

export interface InstantTradeBotRequest {
  txHash: string;
  walletAddress: string;
  fromAmount: number;
  toAmount: number;
  fromSymbol: string;
  toSymbol: string;
  blockchain: BlockchainName;
  price: number;
  provider: INSTANT_TRADE_PROVIDER;
}
