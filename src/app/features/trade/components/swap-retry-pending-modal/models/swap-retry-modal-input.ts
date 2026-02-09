import { SelectedTrade } from '@app/features/trade/models/selected-trade';

export interface SwapRetryModalInput {
  initialBackupsCount: number;
  backupTradesCount: number;
  isBackupProviderSelected: boolean;
  isRateChanged: boolean;
  selectedTradeState: SelectedTrade | null;
}
