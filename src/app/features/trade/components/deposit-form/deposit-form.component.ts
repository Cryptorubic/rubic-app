import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DepositFormManager]
})
export class DepositFormComponent implements OnInit, OnDestroy {
  public readonly depositFormState$ = this.depositFormManager.depositFormState$;

  public readonly tradeId$ = this.depositFormManager.depositTrade$.pipe(
    map(depositTrade => depositTrade?.id || null),
    startWith(null)
  );

  public readonly formTitle$ = this.depositFormState$.pipe(
    map(depositFormState => DEPOSIT_FORM_TITLE[depositFormState]),
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

  ngOnInit(): void {
    this.depositFormManager.init();
  }

  ngOnDestroy(): void {
    this.depositFormManager.cleanup();
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
  }

  public handleTradeExpired(): void {
    this.depositFormManager.setDepositFormState(DEPOSIT_FORM_STATE.EXPIRED);
  }
}
