import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { DepositService } from '@features/trade/services/deposit/deposit.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositData
} from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { specificProviderStatusText } from '@app/features/trade/components/deposit-form/constants/specific-provider-status';

@Component({
  selector: 'app-deposit-status-bar',
  standalone: false,
  templateUrl: './deposit-status-bar.component.html',
  styleUrl: './deposit-status-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositStatusBarComponent {
  public readonly status$ = combineLatest([
    this.depositService.status$.pipe(
      startWith({
        status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
        dstHash: null
      } as CrossChainDepositData)
    ),
    this.depositService.depositTrade$.pipe(startWith(null))
  ]).pipe(
    map(([status, depositTrade]) => {
      const specificStatusText = depositTrade?.tradeType
        ? specificProviderStatusText[depositTrade.tradeType]?.[status.status]
        : null;
      return specificStatusText ? CROSS_CHAIN_DEPOSIT_STATUS.FAILED : status.status;
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
