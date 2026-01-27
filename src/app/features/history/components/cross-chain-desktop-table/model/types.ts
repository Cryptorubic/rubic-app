import { ProviderInfo } from '@app/features/trade/models/provider-info';
import { ChainType, EvmBlockchainName } from '@cryptorubic/core';

export interface TableRowWithActionButton {
  provider: ProviderInfo;
  status: string;
  fromBlockchain: EvmBlockchainName;
  toChainType: ChainType;
}

export interface ActionButtonLoadingStatus {
  fromTxHash: string;
  isLoading: boolean;
}
