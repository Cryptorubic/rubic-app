import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TRADE_STATUS } from '../../../core/services/backend/bridge-api/models/TRADE_STATUS';

export type BlockchainApi = 'ETH' | 'BSC' | 'POL';

export interface BridgeTableTradeApi {
  fromNetwork: BlockchainApi;
  toNetwork: BlockchainApi;
  actualFromAmount: string;
  actualToAmount: string;
  ethSymbol: string;
  bscSymbol: string;
  updateTime: string;
  status: string;
  transaction_id: string;
  walletFromAddress: string;
  walletToAddress: string;
  walletDepositAddress: string;
  code: 0 | 1 | 2;
  image_link: string;
}

export interface BridgeTableTrade {
  status: TRADE_STATUS;
  statusCode: 0 | 1 | 2;
  fromBlockchain: BLOCKCHAIN_NAME;
  toBlockchain: BLOCKCHAIN_NAME;
  fromAmount: string;
  toAmount: string;
  fromSymbol: string;
  toSymbol: string;
  updateTime: string;
  transactionHash: string;
  tokenImage: string;
}
