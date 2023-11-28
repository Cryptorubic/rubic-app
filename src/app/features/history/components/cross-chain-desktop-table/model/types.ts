import { CrossChainTradeType, EvmBlockchainName } from 'rubic-sdk';

export interface TableRowWithActionButton {
  provider: CrossChainTradeType;
  status: string;
  fromBlockchain: EvmBlockchainName;
}

export interface ActionButtonLoadingStatus {
  fromTxHash: string;
  isLoading: boolean;
}
