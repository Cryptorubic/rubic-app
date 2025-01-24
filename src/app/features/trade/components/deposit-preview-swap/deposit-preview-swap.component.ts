import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Self } from '@angular/core';
import { combineLatest, firstValueFrom, merge, Observable, timer } from 'rxjs';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { distinctUntilChanged, first, map, startWith, takeUntil } from 'rxjs/operators';
import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  CrossChainTransferTrade,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  FeeInfo,
  nativeTokensList,
  OnChainTrade,
  Web3Pure
} from 'rubic-sdk';
import { Router } from '@angular/router';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import BigNumber from 'bignumber.js';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { HeaderStore } from '@core/header/services/header.store';
import { TRADES_PROVIDERS } from '@features/trade/constants/trades-providers';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { NAVIGATOR } from '@ng-web-apis/common';
import { DepositService } from '../../services/deposit/deposit.service';
import { RefundService } from '../../services/refund-service/refund.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ModalService } from '@app/core/modals/services/modal.service';
import { specificProviderStatusText } from './constants/specific-provider-status';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-deposit-preview-swap',
  templateUrl: './deposit-preview-swap.component.html',
  styleUrls: ['./deposit-preview-swap.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('showDepositAddressAnimation', [
      transition(':enter', [
        style({ height: '0px', padding: 0, 'margin-top': 0 }),
        animate('0.3s ease-out', style({ height: '54px', padding: '1rem', 'margin-top': '1rem' }))
      ])
    ])
  ]
})
export class DepositPreviewSwapComponent {
  public readonly status$ = combineLatest([
    this.depositService.status$.pipe(startWith(CROSS_CHAIN_DEPOSIT_STATUS.WAITING)),
    this.depositService.depositTrade$.pipe(startWith(null))
  ]).pipe(
    map(([status, depositTrade]) => {
      const specificStatusText = specificProviderStatusText[depositTrade?.tradeType]?.[status];
      return specificStatusText ? CROSS_CHAIN_DEPOSIT_STATUS.FAILED : status;
    })
  );

  public readonly specificProviderStatusText$ = combineLatest([
    this.depositService.status$,
    this.depositService.depositTrade$
  ]).pipe(
    map(([status, depositTrade]) => {
      const specificStatusText = specificProviderStatusText[depositTrade?.tradeType]?.[status];
      return specificStatusText ? specificStatusText : null;
    })
  );

  public readonly fromAsset$ = this.swapsFormService.fromToken$.pipe(first());

  public readonly toAsset$ = this.swapsFormService.toToken$.pipe(first());

  public readonly fromAmount$ = this.swapsFormService.fromAmount$.pipe(first());

  private readonly calculatedToAmount$ = this.swapsFormService.toAmount$
    .pipe(map(amount => (amount ? { actualValue: amount, visibleValue: amount?.toFixed() } : null)))
    .pipe(first());

  public readonly toAmount$ = merge(
    this.calculatedToAmount$,
    this.depositService.depositTrade$.pipe(
      map(depositTrade => {
        return depositTrade?.toAmount
          ? {
              actualValue: depositTrade.toAmount,
              visibleValue: depositTrade.toAmount.toFixed()
            }
          : null;
      })
    )
  );

  public readonly isToAmountCalculated$ = this.toAmount$.pipe(map(toAmount => Boolean(toAmount)));

  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly tradeInfo$ = this.previewSwapService.tradeInfo$;

  public readonly nativeToken$ = this.swapsFormService.nativeToken$;

  public readonly tradeState$: Observable<SelectedTrade & { feeInfo: FeeInfo }> =
    this.previewSwapService.selectedTradeState$.pipe(
      map(tradeState => {
        const info = tradeState.trade.getTradeInfo();

        return {
          ...tradeState,
          feeInfo: info?.feeInfo
        };
      })
    );

  public readonly transactionState$ = this.previewSwapService.transactionState$;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  protected readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly depositTrade$ = this.depositService.depositTrade$;

  public readonly isRefundAddressRequired$ = this.previewSwapService.selectedTradeState$.pipe(
    map(tradeState => tradeState.tradeType === CROSS_CHAIN_TRADE_TYPE.CHANGELLY)
  );

  public readonly isValidRefundAddress$ = this.refundService.isValidRefundAddress$;

  public hintShown: boolean = false;

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly router: Router,
    private readonly swapsFormService: SwapsFormService,
    private readonly headerStore: HeaderStore,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly depositService: DepositService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly refundService: RefundService,
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
    private readonly cdr: ChangeDetectorRef,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly modalService: ModalService
  ) {
    this.previewSwapService.setSelectedProvider();
    this.setupTradeIfValidRefundAddress();
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
    this.previewSwapService.setNextTxState({
      step: 'inactive',
      data: {}
    });
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
    const trade = await firstValueFrom(this.tradeState$);
    const isCrossChain = trade.trade instanceof CrossChainTrade;
    await this.router.navigate(['/history'], {
      queryParamsHandling: 'preserve',
      state: { type: isCrossChain ? 'cross-chain' : 'on-chain' }
    });
  }

  public getAverageTime(trade: SelectedTrade & { feeInfo: FeeInfo }): string {
    if (trade?.tradeType) {
      const provider = TRADES_PROVIDERS[trade.tradeType];
      const providerAverageTime = this.platformConfigurationService.providersAverageTime;
      const currentProviderTime = providerAverageTime?.[trade.tradeType as CrossChainTradeType];

      return currentProviderTime ? `${currentProviderTime} M` : `${provider.averageTime} M`;
    } else {
      return trade instanceof CrossChainTrade ? '30 M' : '3 M';
    }
  }

  public getGasData(
    trade: CrossChainTrade | OnChainTrade
  ): { amount: BigNumber; symbol: string } | null {
    let gasData = null;
    if (trade instanceof EvmCrossChainTrade) {
      gasData = trade.gasData;
    } else if (trade instanceof EvmOnChainTrade) {
      gasData = trade.gasFeeInfo;
    }

    if (!gasData) return null;

    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];

    let gasFeeWei = null;
    if (gasData.gasLimit) {
      gasFeeWei = gasData.gasLimit.multipliedBy(gasData.gasPrice ?? 0);
    } else if (gasData.totalGas) {
      gasFeeWei = Web3Pure.fromWei(gasData.totalGas, nativeToken.decimals);
    }

    if (!gasFeeWei) return null;

    return {
      amount: Web3Pure.fromWei(gasFeeWei, nativeToken.decimals),
      symbol: nativeToken.symbol
    };
  }

  private async setupTrade(): Promise<void> {
    const receiverAddress = this.targetAddressService.address;
    const selectedTrade = await firstValueFrom(this.tradeState$);
    this.depositService.removePrevDeposit();

    try {
      const paymentInfo = await (selectedTrade.trade as CrossChainTransferTrade).getTransferTrade(
        receiverAddress,
        this.refundService.refundAddress
      );

      this.depositService.updateTrade(paymentInfo, receiverAddress);
      this.depositService.setupUpdate();
    } catch (err) {
      console.error(`DepositPreviewSwapComponent_setupTrade_error ===> ${err}`);
      const backToForm = await this.modalService.openDepositTradeRateChangedModal(selectedTrade);

      if (backToForm) {
        this.tradePageService.setState('form');
      }
    }
  }

  /**
   * Copy error message to clipboard.
   */
  public copyToClipboard(address: string): void {
    this.showHint();
    this.navigator.clipboard.writeText(address);
  }

  /**
   * Show copy to clipboard hint.
   */
  private showHint(): void {
    this.hintShown = true;
    timer(1500).subscribe(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    });
  }

  private setupTradeIfValidRefundAddress(): void {
    this.refundService.isValidRefundAddress$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(isValid => {
        if (isValid) {
          this.setupTrade();
        } else {
          this.depositService.removePrevDeposit();
        }
      });
  }
}
