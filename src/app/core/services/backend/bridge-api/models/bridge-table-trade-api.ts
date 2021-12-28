import { BridgeProvider } from '@shared/models/bridge/bridge-provider';
import { TransactionStatus } from '@shared/models/blockchain/transaction-status';

export type BridgeBlockchainApi = 'ETH' | 'BSC' | 'POL' | 'XDAI' | 'TRX';

export interface BridgeTableTradeApi {
  transaction_id: string;
  fromTransactionHash: string;
  toTransactionHash: string;
  type: BridgeProvider;
  status: TransactionStatus;
  ethSymbol: string;
  bscSymbol: string;
  fromNetwork: BridgeBlockchainApi;
  toNetwork: BridgeBlockchainApi;
  actualFromAmount: string;
  actualToAmount: string;
  updateTime: string;
  walletFromAddress: string;
  walletToAddress: string;
  walletDepositAddress: string;
  image_link: string;
}
