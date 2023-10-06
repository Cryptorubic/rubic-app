import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { animate, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, interval } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';
import { TokensService } from '@core/services/tokens/tokens.service';
import { EvmWeb3Pure } from 'rubic-sdk';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('progress', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('0.2s ease-out', style({ height: '53px', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '63px', opacity: 1 }),
        animate('0.2s ease-in', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class ProvidersListComponent {
  @Input({ required: true }) states: TradeState[] = [];

  @Input({ required: true }) selectedTradeType: TradeProvider;

  @Input({ required: true }) showCalculation: boolean;

  @Input({ required: true }) set calculationProgress(value: { total: number; current: number }) {
    this._calculationProgress = value;
    if (value.current === 0) {
      this._triggerCalculation$.next();
    }
  }

  private _calculationProgress: { total: number; current: number };

  public get calculationProgress(): { total: number; current: number } {
    return this._calculationProgress;
  }

  public readonly toToken$ = this.swapsFormService.toToken$;

  @Output() readonly selectTrade = new EventEmitter<TradeProvider>();

  private readonly _triggerCalculation$ = new BehaviorSubject<void>(null);

  public readonly calculationProcess$ = this._triggerCalculation$.asObservable().pipe(
    switchMap(() => interval(100)),
    takeWhile(el => el < 150),
    map(time => ({ total: 150, current: time }))
  );

  public readonly nativeToken$ = this.swapsFormService.fromBlockchain$.pipe(
    switchMap(blockchain =>
      this.tokensService.findToken({ address: EvmWeb3Pure.EMPTY_ADDRESS, blockchain })
    )
  );

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly tokensService: TokensService
  ) {}

  public handleTradeSelection(event: MouseEvent, tradeType: TradeProvider): void {
    const element = event.target as HTMLElement;

    if (
      element?.parentElement?.className?.includes?.('element__expander') ||
      element?.parentElement?.parentElement?.className?.includes?.('element__expander') ||
      element?.className?.includes?.('element__expander')
    ) {
      event.preventDefault();
      return;
    }
    this.selectTrade.emit(tradeType);
  }
}
