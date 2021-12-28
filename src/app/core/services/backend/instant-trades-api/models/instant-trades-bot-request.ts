import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { InstantTradeProvider } from '@shared/models/instant-trade/instant-trade-provider';

export interface InstantTradeBotRequest {
  txHash: string;
  walletAddress: string;
  fromAmount: number;
  toAmount: number;
  fromSymbol: string;
  toSymbol: string;
  blockchain: BLOCKCHAIN_NAME;
  price: number;
  provider: InstantTradeProvider;
}
