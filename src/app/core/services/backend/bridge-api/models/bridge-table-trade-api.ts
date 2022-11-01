import { RUBIC_BRIDGE_PROVIDER } from '@features/swaps/shared/models/trade-provider/bridge-provider';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';

export type BridgeBlockchainApi = 'ETH' | 'BSC' | 'POL';

export interface BridgeTableTradeApi {
  transaction_id: string;
  fromTransactionHash: string;
  toTransactionHash: string;
  type: RUBIC_BRIDGE_PROVIDER;
  status: TRANSACTION_STATUS;
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
