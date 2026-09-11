import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TradePageService } from '../../services/trade-page/trade-page.service';
import { DepositFormManager } from './services/deposit-form-manager';
import { DEPOSIT_FORM_STATE } from './models/deposit-form-states';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';

@Component({
  selector: 'app-deposit-form',
  standalone: false,
  templateUrl: './deposit-form.component.html',
  styleUrl: './deposit-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormComponent {
  public readonly tradeId$: Observable<string> = of('HCEv8CCq5i6ob7iXpHuGpv1L89pZStycPBeXSi37b7nH');

  public readonly formTitle$ = of('Deposit Funds');

  public readonly depositFormState$ = this.depositFormManager.depositFormState$;

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly depositFormManager: DepositFormManager,
    private readonly previewSwapService: PreviewSwapService
  ) {
    this.previewSwapService.setSelectedProvider();
    this.previewSwapService.activateDepositPage();
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
  }

  public handleTradeExpired(): void {
    this.depositFormManager.setDepositFormState(DEPOSIT_FORM_STATE.EXPIRED);
  }
}
