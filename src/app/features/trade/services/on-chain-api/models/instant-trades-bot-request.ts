import { BlockchainName, OnChainTradeType } from '@cryptorubic/sdk';

export interface InstantTradeBotRequest {
  txHash: string;
  walletAddress: string;
  fromAmount: number;
  toAmount: number;
  fromSymbol: string;
  toSymbol: string;
  blockchain: BlockchainName;
  price: number;
  provider: OnChainTradeType;
}
