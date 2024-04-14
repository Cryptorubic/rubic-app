import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector
} from '@angular/core';
import { firstValueFrom, Observable, of, timer } from 'rxjs';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { first, map, switchMap } from 'rxjs/operators';
import {
  ChangenowCrossChainTrade,
  CrossChainTradeType,
  EvmBlockchainName,
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
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import BigNumber from 'bignumber.js';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { ModalService } from '@core/modals/services/modal.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { HeaderStore } from '@core/header/services/header.store';
import { TRADES_PROVIDERS } from '@features/trade/constants/trades-providers';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { CnSwapService } from '@features/trade/services/cn-swap/cn-swap.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { NAVIGATOR } from '@ng-web-apis/common';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';

@Component({
  selector: 'app-cn-preview-swap',
  templateUrl: './cn-preview-swap.component.html',
  styleUrls: ['./cn-preview-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CnPreviewSwapComponent {
  public selectedForm$ = this.formsTogglerService.selectedForm$;

  public readonly status$ = this.cnSwapService.status$;

  public readonly fromAsset$ = this.swapsFormService.fromToken$.pipe(first());

  public readonly toAsset$ = this.swapsFormService.toToken$.pipe(first());

  public readonly fromAmount$ = this.swapsFormService.fromAmount$.pipe(first());

  public readonly toAmount$ = this.swapsFormService.toAmount$
    .pipe(map(amount => (amount ? { actualValue: amount, visibleValue: amount?.toFixed() } : null)))
    .pipe(first());

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

  public readonly cnTrade$ = this.cnSwapService.cnTrade$;

  public hintShown: boolean = false;

  constructor(
    private readonly tradePageService: TradePageService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly router: Router,
    private readonly swapsFormService: SwapsFormService,
    private readonly walletConnector: WalletConnectorService,
    private readonly modalService: ModalService,
    @Inject(Injector) private injector: Injector,
    private readonly tokensService: TokensService,
    private readonly headerStore: HeaderStore,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly cnSwapService: CnSwapService,
    private readonly targetAddressService: TargetNetworkAddressService,
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
    private readonly cdr: ChangeDetectorRef,
    private readonly formsTogglerService: FormsTogglerService
  ) {
    this.previewSwapService.setSelectedProvider();
    this.setupTrade();
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

  private async switchChain(): Promise<void> {
    const blockchain = this.swapsFormService.inputValue.fromBlockchain;
    const switched = await this.walletConnector.switchChain(blockchain as EvmBlockchainName);
    if (switched) {
      await this.previewSwapService.requestTxSign();
    }
  }

  private connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector)
      .pipe(
        switchMap(() => this.walletConnector.addressChange$),
        switchMap(el => (Boolean(el) ? this.previewSwapService.requestTxSign() : of(null)))
      )
      .subscribe();
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

    if (!gasData || !gasData.gasLimit) {
      return null;
    }
    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const gasLimit = gasData.gasLimit.multipliedBy(gasData.gasPrice);

    return {
      amount: Web3Pure.fromWei(gasLimit, trade.from.decimals),
      symbol: nativeToken.symbol
    };
  }

  private async setupTrade(): Promise<void> {
    const receiverAddress = this.targetAddressService.address;
    const selectedTrade = await firstValueFrom(this.tradeState$);

    const paymentInfo = await (
      selectedTrade.trade as ChangenowCrossChainTrade
    ).getChangenowPostTrade(receiverAddress);

    this.cnSwapService.updateTrade(paymentInfo, receiverAddress);
    this.cnSwapService.setupUpdate();
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
}
