import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { RateChangeInfo } from '../../models/rate-change-info';
import { TradeInfo } from '../../models/trade-info';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

@Component({
  selector: 'app-swap-backup-rate-changed-modal',
  templateUrl: './swap-backup-rate-changed-modal.component.html',
  styleUrls: ['./swap-backup-rate-changed-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapBackupRateChangedModalComponent {
  public readonly tradeState: SelectedTrade;

  public readonly rateChangeInfo: RateChangeInfo;

  public readonly difference: BigNumber;

  public readonly tradeInfo$: Observable<TradeInfo>;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { trade: SelectedTrade; tradeInfo$: Observable<TradeInfo>; rateChangeInfo: RateChangeInfo }
    >,
    private readonly headerStore: HeaderStore
  ) {
    this.tradeState = context.data.trade;
    this.tradeInfo$ = context.data.tradeInfo$;
    this.rateChangeInfo = context.data.rateChangeInfo;

    this.difference = this.rateChangeInfo.oldAmount
      .minus(this.rateChangeInfo.newAmount)
      .dividedBy(this.rateChangeInfo.oldAmount)
      .multipliedBy(-100);
    this.rateChangeInfo.tokenSymbol = context.data.rateChangeInfo.tokenSymbol;
  }

  public onConfirm(): void {
    this.context.completeWith(true);
  }

  public onCancel(): void {
    this.context.completeWith(false);
  }

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }
}
