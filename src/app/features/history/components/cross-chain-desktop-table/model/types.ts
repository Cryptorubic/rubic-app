import { ProviderInfo } from '@app/features/trade/models/provider-info';

export interface TableRowWithActionButton {
  provider: ProviderInfo;
  status: string;
}

export interface ActionButtonLoadingStatus {
  fromTxHash: string;
  isLoading: boolean;
}
