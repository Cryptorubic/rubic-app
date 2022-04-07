import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface BridgeBotRequest {
  txHash: string;
  walletAddress: string;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  amount: number;
  symbol: string;
  price: number;
}
