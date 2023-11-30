import { ChangeDetectionStrategy, Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { map, tap } from 'rxjs/operators';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { ON_CHAIN_TRADE_TYPE } from 'rubic-sdk';
import { SwapTokensUpdaterService } from '@features/trade/services/swap-tokens-updater-service/swap-tokens-updater.service';
import { TradeState } from '@features/trade/models/trade-state';

@Component({
  selector: 'app-trade-view-container',
  templateUrl: './trade-view-container.component.html',
  styleUrls: ['./trade-view-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-25%)', opacity: 0.5 }),
        animate('1s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 0.5, width: '360px' }),
        animate('0.2s ease-in', style({ transform: 'translateX(-25%)', opacity: 0, width: 0 }))
      ])
    ])
  ]
})
export class TradeViewContainerComponent {
  public readonly formContent$ = this.tradePageService.formContent$;

  public readonly providers$ = this.swapsState.tradesStore$.pipe(
    tap(providers => this.setProvidersVisibility(providers)),
    map(providers => providers.filter(provider => provider.trade))
  );

  public readonly calculationStatus$ = this.swapsState.calculationStatus$;

  public readonly selectedTradeType$ = this.swapsState.tradeState$.pipe(map(el => el.tradeType));

  constructor(
    private readonly swapsState: SwapsStateService,
    private readonly tradePageService: TradePageService,
    public readonly swapFormQueryService: SwapFormQueryService,
    public readonly swapFormService: SwapsFormService,
    public readonly swapTokensUpdaterService: SwapTokensUpdaterService
  ) {}

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    await this.swapsState.selectTrade(tradeType);
    this.getSwapPreview();
  }

  public getSwapPreview(): void {
    this.tradePageService.setState('preview');
  }

  private setProvidersVisibility(providers: TradeState[]): void {
    if (this.swapFormService.isFilled) {
      let timeout: NodeJS.Timeout;
      if (providers.length === 0) {
        timeout = setTimeout(() => {
          this.tradePageService.setProvidersVisibility(true);
          clearTimeout(timeout);
        }, 1_500);
      } else if (providers[0].trade?.type === ON_CHAIN_TRADE_TYPE.WRAPPED) {
        if (timeout) {
          clearTimeout(timeout);
        }
        this.tradePageService.setProvidersVisibility(false);
      } else if (providers.length > 0) {
        this.tradePageService.setProvidersVisibility(true);
        if (timeout) {
          clearTimeout(timeout);
        }
      } else {
        if (!timeout) {
          this.tradePageService.setProvidersVisibility(false);
        }
      }
    }
  }
}
