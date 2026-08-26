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
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { PolymorpheusInput } from '@shared/decorators/polymorpheus-input';
import { ProviderHintService } from '../../services/provider-hint/provider-hint.service';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { isPrivateTrade } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-private-trade';

@Component({
  standalone: false,
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

  @PolymorpheusInput()
  @Input()
  public readonly privateOnly: boolean = this.context?.data?.privateOnly || false;

  @Output() readonly selectTrade = new EventEmitter<TradeProvider>();

  public readonly toToken$ = this.swapsFormService.toToken$;

  public readonly nativeToken$ = this.tokensFacade.nativeToken$;

  public readonly hideHint$ = this.providerHintService.hideProviderHint$;

  public get showEmptyPrivateList(): boolean {
    return (
      this.privateOnly &&
      this.states.length === 0 &&
      this.calculationProgress?.total > 0 &&
      this.calculationProgress.current === this.calculationProgress.total
    );
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
        privateOnly: boolean;
      }
    >,
    private readonly swapsFormService: SwapsFormService,
    private readonly providerHintService: ProviderHintService,
    private readonly tokensFacade: TokensFacadeService
  ) {}

  public isBestProvider(tradeState: TradeState): boolean {
    if (this.privateOnly) {
      return this.states[0]?.tradeType === tradeState.tradeType;
    }

    const nonPrivate = this.states.filter(state => !isPrivateTrade(state));
    if (nonPrivate.length > 0) {
      return tradeState.tradeType === nonPrivate[0].tradeType;
    }
    return false;
  }

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
}
