import { BRIDGE_PROVIDER } from 'src/app/shared/models/bridge/BRIDGE_PROVIDER';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';

export type BridgeBlockchainApi = 'ETH' | 'BSC' | 'POL' | 'TRX' | 'XDAI';

export interface BridgeTableTradeApi {
  transaction_id: string;
  type: BRIDGE_PROVIDER;
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
