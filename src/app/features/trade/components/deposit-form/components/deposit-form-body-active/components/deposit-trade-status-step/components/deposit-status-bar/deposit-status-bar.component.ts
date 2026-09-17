import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { DepositService } from '@features/trade/services/deposit/deposit.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { specificProviderStatusText } from '@features/trade/components/deposit-preview-swap/constants/specific-provider-status';
import { CROSS_CHAIN_DEPOSIT_STATUS } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';

@Component({
  selector: 'app-deposit-status-bar',
  standalone: false,
  templateUrl: './deposit-status-bar.component.html',
  styleUrl: './deposit-status-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositStatusBarComponent {
  public readonly status$ = combineLatest([
    this.depositService.status$.pipe(startWith(CROSS_CHAIN_DEPOSIT_STATUS.WAITING)),
    this.depositService.depositTrade$.pipe(startWith(null))
  ]).pipe(
    map(([status, depositTrade]) => {
      const specificStatusText = depositTrade?.tradeType
        ? specificProviderStatusText[depositTrade.tradeType]?.[status]
        : null;
      return specificStatusText ? CROSS_CHAIN_DEPOSIT_STATUS.FAILED : status;
    })
  );

  public readonly needTrustline$ = this.previewSwapService.transactionState$.pipe(
    map(state => state.data.needTrustlineOptions?.needTrustlineBeforeSwap),
    filter(v => v !== undefined)
  );

  public readonly isPrivate$ = this.previewSwapService.selectedTradeState$.pipe(
    map(tradeState => tradeState?.private)
  );

  constructor(
    private readonly depositService: DepositService,
    private readonly previewSwapService: PreviewSwapService
  ) {}
}
