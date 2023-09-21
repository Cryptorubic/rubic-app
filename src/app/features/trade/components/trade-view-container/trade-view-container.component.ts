import { ChangeDetectionStrategy, Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { map } from 'rxjs/operators';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';

@Component({
  selector: 'app-trade-view-container',
  templateUrl: './trade-view-container.component.html',
  styleUrls: ['./trade-view-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-25%)', opacity: 0.5 }),
        animate('0.2s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
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
    map(providers => providers.filter(provider => provider.trade))
  );

  public readonly showProviders$ = this.swapFormService.isFilled$;
  // /this.providers$.pipe(map(providers => providers.length > 0));

  public readonly selectedTradeType$ = this.swapsState.tradeState$.pipe(map(el => el.tradeType));

  constructor(
    private readonly swapsState: SwapsStateService,
    private readonly tradePageService: TradePageService,
    public readonly swapFormQueryService: SwapFormQueryService,
    private readonly swapFormService: SwapsFormService
  ) {}

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    await this.swapsState.selectTrade(tradeType);
    this.getSwapPreview();
  }

  public getSwapPreview(): void {
    this.tradePageService.setState('preview');
  }
}
