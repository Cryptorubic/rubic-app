import { BlockchainName } from 'rubic-sdk';

export interface BridgeBotRequest {
  txHash: string;
  walletAddress: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  amount: number;
  symbol: string;
  price: number;
}
