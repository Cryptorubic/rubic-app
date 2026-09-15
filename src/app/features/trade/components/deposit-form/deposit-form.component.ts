import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { map, startWith } from 'rxjs';
import { TradePageService } from '../../services/trade-page/trade-page.service';
import { DepositFormManager } from './services/deposit-form-manager';
import { DEPOSIT_FORM_STATE } from './models/deposit-form-states';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import { DEPOSIT_FORM_TITLE } from './constants/deposit-form-titles';

@Component({
  selector: 'app-deposit-form',
  standalone: false,
  templateUrl: './deposit-form.component.html',
  styleUrl: './deposit-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormComponent implements OnDestroy {
  public readonly depositFormInfo$ = this.depositFormManager.depositFormInfo$;

  public readonly tradeId$ = this.depositFormInfo$.pipe(
    map(depositFormInfo => depositFormInfo.trade.paymentInfo?.id || null),
    startWith(null)
  );

  public readonly formTitle$ = this.depositFormInfo$.pipe(
    map(depositFormInfo => DEPOSIT_FORM_TITLE[depositFormInfo.state]),
    startWith(DEPOSIT_FORM_TITLE.IDLE)
  );

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly depositFormManager: DepositFormManager,
    private readonly previewSwapService: PreviewSwapService
  ) {
    this.previewSwapService.setSelectedProvider();
    this.previewSwapService.activateDepositPage();
  }

  ngOnDestroy(): void {
    this.depositFormManager.cleanup();
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
  }

  public handleTradeExpired(): void {
    this.depositFormManager.patchDepositFormInfo({ state: DEPOSIT_FORM_STATE.EXPIRED });
  }
}
