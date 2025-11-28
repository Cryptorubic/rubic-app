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
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { PolymorpheusInput } from '@shared/decorators/polymorpheus-input';
import { ProviderHintService } from '../../services/provider-hint/provider-hint.service';
import { CrossChainTrade, OnChainTrade } from '@cryptorubic/sdk';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersListComponent {
  @PolymorpheusInput()
  @Input({ required: true })
  public readonly isModal: boolean = this.context?.data?.isModal || false;

  @PolymorpheusInput()
  @Input()
  public readonly shortedInfo: boolean = this.context?.data?.shortedInfo || false;

  @PolymorpheusInput()
  @Input({ required: true })
  public readonly states: TradeState[] = this.context?.data?.states || [];

  @PolymorpheusInput()
  @Input({ required: true })
  public readonly selectedTradeType: TradeProvider = this.context?.data?.selectedTradeType;

  @PolymorpheusInput()
  @Input({ required: true })
  calculationProgress: CalculationProgress = this.context?.data?.calculationProgress;

  @Output() readonly selectTrade = new EventEmitter<TradeProvider>();

  public readonly toToken$ = this.swapsFormService.toToken$;

  public readonly nativeToken$ = this.tokensFacade.nativeToken$;

  public readonly hideHint$ = this.providerHintService.hideProviderHint$;

  public handleTradeSelection(
    event: MouseEvent,
    tradeType: TradeProvider,
    trade: CrossChainTrade | OnChainTrade,
    tradeError?: Error
  ): void {
    const isZeroOrNegativeAmount = trade.to.tokenAmount.lte(0);

    if (isZeroOrNegativeAmount || tradeError) {
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
        noRoutes: boolean;
      }
    >,
    private readonly swapsFormService: SwapsFormService,
    private readonly providerHintService: ProviderHintService,
    private readonly tokensFacade: TokensFacadeService
  ) {}
}
