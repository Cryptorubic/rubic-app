import { ProviderInfo } from '@app/features/trade/models/provider-info';
import { EvmBlockchainName } from '@cryptorubic/core';

export interface TableRowWithActionButton {
  provider: ProviderInfo;
  status: string;
  fromBlockchain: EvmBlockchainName;
}

export interface ActionButtonLoadingStatus {
  fromTxHash: string;
  isLoading: boolean;
}
