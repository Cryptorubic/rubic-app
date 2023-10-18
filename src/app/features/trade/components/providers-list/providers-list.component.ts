import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output
} from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import { CalculationProgress } from '@features/trade/models/calculationProgress';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { switchMap } from 'rxjs/operators';
import { EvmWeb3Pure } from 'rubic-sdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { PolymorpheusInput } from '@shared/decorators/polymorpheus-input';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersListComponent {
  @PolymorpheusInput()
  @Input({ required: true })
  isModal: boolean = this.context?.data?.isModal || false;

  @PolymorpheusInput()
  @Input()
  shortedInfo: boolean = this.context?.data?.shortedInfo || false;

  @PolymorpheusInput()
  @Input({ required: true })
  states: TradeState[] = this.context?.data?.states || [];

  @PolymorpheusInput()
  @Input({ required: true })
  selectedTradeType: TradeProvider = this.context?.data?.selectedTradeType;

  @PolymorpheusInput()
  @Input({ required: true })
  calculationProgress: CalculationProgress = this.context?.data?.calculationProgress;

  @Output() readonly selectTrade = new EventEmitter<TradeProvider>();

  public readonly toToken$ = this.swapsFormService.toToken$;

  public readonly nativeToken$ = this.swapsFormService.fromBlockchain$.pipe(
    switchMap(blockchain =>
      this.tokensService.findToken({ address: EvmWeb3Pure.EMPTY_ADDRESS, blockchain })
    )
  );

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

    if (this.isModal) {
      this.context.completeWith(tradeType);
    } else {
      this.selectTrade.emit(tradeType);
    }
  }

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      TradeProvider,
      {
        states: TradeState[];
        selectedTradeType: TradeProvider;
        calculationProgress: CalculationProgress;
        isModal: boolean;
        shortedInfo: boolean;
      }
    >,
    private readonly swapsFormService: SwapsFormService,
    private readonly tokensService: TokensService
  ) {}
}
