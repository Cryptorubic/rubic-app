import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { animate, style, transition, trigger } from '@angular/animations';

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

  @Input({ required: true }) calculationProgress: { total: number; current: number };

  public readonly toToken$ = this.swapsFormService.toToken$;

  @Output() readonly selectTrade = new EventEmitter<TradeProvider>();

  constructor(private readonly swapsFormService: SwapsFormService) {}

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
