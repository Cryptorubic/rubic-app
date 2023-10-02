import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { TransactionStateComponent } from '@features/trade/components/transaction-state/transaction-state.component';
import { map } from 'rxjs/operators';
import { transactionStep } from '@features/trade/models/transaction-steps';
import { EvmBlockchainName, FeeInfo } from 'rubic-sdk';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { Router } from '@angular/router';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

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
        label: TransactionStateComponent.getLabel(el.step),
        disabled: true
      };
      if (el.step === transactionStep.approveReady) {
        state.disabled = false;
        state.action = this.approve.bind(this);
      } else if (el.step === transactionStep.swapReady) {
        state.disabled = false;
        state.action = this.swap.bind(this);
      } else if (el.step === transactionStep.idle) {
        state.disabled = false;
        state.action = this.startTrade.bind(this);
      } else if (el.step === transactionStep.success) {
        state.disabled = false;
        state.label = 'Done';
        state.action = this.backToForm.bind(this);
      }

      if (el.data?.wrongNetwork) {
        state.disabled = false;
        state.action = this.switchChain.bind(this);
        state.label = `Change network`;
      }
      return state;
    })
  );

  protected readonly ADDRESS_TYPE = ADDRESS_TYPE;

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly router: Router,
    private readonly swapsFormService: SwapsFormService,
    private readonly walletConnector: WalletConnectorService
  ) {}

  public backToForm(): void {
    this.tradePageService.setState('form');
    this.previewSwapService.setNextTxState({ step: 'idle', data: {} });
  }

  public async startTrade(): Promise<void> {
    await this.previewSwapService.requestTxSign();
  }

  public async swap(): Promise<void> {
    this.previewSwapService.startSwap();
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

  private async switchChain(): Promise<void> {
    const blockchain = this.swapsFormService.inputValue.fromBlockchain;
    await this.walletConnector.switchChain(blockchain as EvmBlockchainName);
  }
}
