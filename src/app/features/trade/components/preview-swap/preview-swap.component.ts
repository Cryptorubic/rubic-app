import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { TransactionStateComponent } from '@features/trade/components/transaction-state/transaction-state.component';
import { map } from 'rxjs/operators';
import { transactionStep } from '@features/trade/models/transaction-steps';
import { FeeInfo } from 'rubic-sdk';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preview-swap',
  templateUrl: './preview-swap.component.html',
  styleUrls: ['./preview-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewSwapComponent {
  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public time = '3 min';

  public readonly tradeInfo$ = this.previewSwapService.tradeInfo$;

  public readonly tradeState$: Observable<SelectedTrade & { feeInfo: FeeInfo }> =
    this.previewSwapService.tradeState$.pipe(
      map(tradeState => {
        const info = tradeState.trade.getTradeInfo();
        return {
          ...tradeState,
          feeInfo: info.feeInfo
        };
      })
    );

  public readonly transactionState$ = this.previewSwapService.transactionState$;

  public readonly buttonState$ = this.transactionState$.pipe(
    map(el => {
      const state = {
        action: (): void => {},
        label: TransactionStateComponent.getLabel(el),
        disabled: true
      };
      if (el === transactionStep.approveReady) {
        state.disabled = false;
        state.action = this.approve.bind(this);
      }
      if (el === transactionStep.swapReady) {
        state.disabled = false;
        state.action = this.swap.bind(this);
      }
      if (el === transactionStep.idle) {
        state.disabled = false;
        state.action = this.startTrade.bind(this);
      }
      if (el === transactionStep.success) {
        state.disabled = false;
        state.label = 'Done';
        state.action = this.backToForm.bind(this);
      }
      return state;
    })
  );

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly router: Router
  ) {}

  public backToForm(): void {
    this.tradePageService.setState('form');
    this.previewSwapService.setNextTxState('idle');
  }

  public async startTrade(): Promise<void> {
    await this.previewSwapService.requestTxSign();
  }

  public async swap(): Promise<void> {
    await this.previewSwapService.startSwap();
  }

  public async approve(): Promise<void> {
    await this.previewSwapService.startApprove();
  }

  public async navigateToHistory(): Promise<void> {
    await this.router.navigate(['/history'], { queryParamsHandling: 'preserve' });
  }

  public async navigateToExplorer(): Promise<void> {
    alert('Navigate to Explorer');
  }
}
