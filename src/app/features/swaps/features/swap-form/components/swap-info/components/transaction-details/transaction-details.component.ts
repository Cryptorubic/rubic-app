import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { FeeInfo, OnChainTrade } from 'rubic-sdk';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { BehaviorSubject, combineLatestWith } from 'rxjs';
import { transactionInfoText } from '@features/swaps/features/swap-form/components/swap-info/constants/transaction-info-text';
import { CrossChainRouteComponent } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/cross-chain-route/cross-chain-route.component';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { formatBigNumber } from '@shared/utils/format-big-number';
import { WithRoundPipe } from '@shared/pipes/with-round.pipe';

interface TransactionDetails {
  feeInfo: FeeInfo;
  priceImpact: number;
  slippage: number;
  route: string[];
  receiverAddress: string;
  minReceived: string;
}

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent {
  private readonly _currentOnChainTrade$ = new BehaviorSubject<OnChainTrade | undefined>(undefined);

  public readonly text = transactionInfoText;

  @Input() set currentOnChainTrade(trade: OnChainTrade | undefined) {
    this._currentOnChainTrade$.next(trade);
  }

  public readonly currentOnChainTrade$ = this._currentOnChainTrade$.asObservable();

  public readonly trade$ = this.swapFormService.outputValue$.pipe(
    combineLatestWith(this.currentOnChainTrade$),
    debounceTime(0),
    map(() => this.getTrade(this.swapModeService.swapMode)),
    distinctUntilChanged()
  );

  public readonly toBlockchain$ = this.trade$.pipe(map(trade => trade?.to?.blockchain));

  public readonly tradeData$ = this.trade$.pipe(map(trade => this.transformTrade(trade)));

  constructor(
    private readonly swapModeService: SwapTypeService,
    private readonly crossChainFormService: CrossChainFormService,
    private readonly swapFormService: SwapFormService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly withRoundPipe: WithRoundPipe
  ) {}

  private getTrade(mode: SWAP_PROVIDER_TYPE): OnChainTrade | CrossChainTrade {
    if (mode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
      return this.crossChainFormService?.selectedTrade?.trade;
    } else if (mode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
      return this._currentOnChainTrade$.value;
    }
  }

  private transformTrade(trade: OnChainTrade | CrossChainTrade): TransactionDetails | null {
    const tradeInfo = trade?.getTradeInfo();
    if (!tradeInfo) {
      return null;
    }
    const routing =
      trade instanceof OnChainTrade
        ? trade.path.map(token => token.symbol)
        : [
            CrossChainRouteComponent.getRoute(
              trade.onChainSubtype.from,
              trade.bridgeType,
              !Boolean(trade.onChainSubtype.from)
            ),
            CrossChainRouteComponent.getRoute(trade.bridgeType, trade.bridgeType, true),
            CrossChainRouteComponent.getRoute(
              trade.onChainSubtype.to,
              trade.bridgeType,
              !Boolean(trade.onChainSubtype.to)
            )
          ].map(route => route.name);
    const receiverAddress =
      this.targetNetworkAddressService.address || this.walletConnectorService.address;

    const minimumReceived = this.withRoundPipe.transform(
      formatBigNumber(
        trade instanceof OnChainTrade ? trade.toTokenAmountMin.tokenAmount : trade.toTokenAmountMin
      ),
      'toClosestValue',
      {
        decimals: trade.to.decimals
      }
    );
    const minimumReceivedString = `${minimumReceived} ${trade.to.symbol}`;

    return {
      feeInfo: trade.feeInfo,
      priceImpact: tradeInfo.priceImpact,
      slippage: tradeInfo.slippage,
      route: routing,
      receiverAddress,
      minReceived: minimumReceivedString
    };
  }
}
