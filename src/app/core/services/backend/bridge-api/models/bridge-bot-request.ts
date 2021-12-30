import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface BridgeBotRequest {
  txHash: string;
  walletAddress: string;
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  amount: number;
  symbol: string;
  price: number;
}
