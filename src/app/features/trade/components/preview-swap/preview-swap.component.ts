import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { TransactionStateComponent } from '@features/trade/components/transaction-state/transaction-state.component';
import { map, switchMap } from 'rxjs/operators';
import { transactionStep } from '@features/trade/models/transaction-steps';
import {
  CrossChainTradeType,
  EvmBlockchainName,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  EvmWeb3Pure,
  FeeInfo,
  nativeTokensList,
  ON_CHAIN_TRADE_TYPE,
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

@Component({
  selector: 'app-preview-swap',
  templateUrl: './preview-swap.component.html',
  styleUrls: ['./preview-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewSwapComponent {
  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly tradeInfo$ = this.previewSwapService.tradeInfo$;

  public readonly nativeToken$ = this.swapsFormService.fromBlockchain$.pipe(
    switchMap(blockchain =>
      this.tokensService.findToken({ address: EvmWeb3Pure.EMPTY_ADDRESS, blockchain })
    )
  );

  public readonly tradeState$: Observable<SelectedTrade & { feeInfo: FeeInfo }> =
    this.previewSwapService.tradeState$.pipe(
      map(tradeState => {
        const info = tradeState.trade.getTradeInfo();
        return {
          ...tradeState,
          feeInfo: info.feeInfo
        };
      })
    );

  public readonly transactionState$ = this.previewSwapService.transactionState$;

  public readonly buttonState$ = this.transactionState$.pipe(
    map(el => {
      const isCrossChain =
        this.swapsFormService.inputValue.fromBlockchain !==
        this.swapsFormService.inputValue.toBlockchain;

      const state = {
        action: (): void => {},
        label: TransactionStateComponent.getLabel(el.step, isCrossChain ? 'bridge' : 'swap'),
        disabled: true
      };
      if (el.step === transactionStep.approveReady) {
        state.disabled = false;
        state.action = this.approve.bind(this);
      } else if (el.step === transactionStep.swapReady) {
        state.disabled = false;
        state.action = this.swap.bind(this);
      } else if (el.step === transactionStep.idle) {
        state.disabled = false;
        state.action = this.startTrade.bind(this);
      } else if (el.step === transactionStep.success) {
        state.disabled = false;
        state.label = 'Done';
        state.action = this.backToForm.bind(this);
      }

      if (el.data?.wrongNetwork && el.step !== transactionStep.success) {
        state.disabled = false;
        state.action = () => this.switchChain();
        state.label = `Change network`;
      }
      if (el.data?.activeWallet === false) {
        state.disabled = false;
        state.action = () => this.connectWallet();
        state.label = `Connect wallet`;
      }
      if (
        (el.step === transactionStep.idle || el.step === transactionStep.swapReady) &&
        !isCrossChain &&
        this.previewSwapService?.tradeState?.trade?.type === ON_CHAIN_TRADE_TYPE.WRAPPED
      ) {
        state.label = 'Wrap';
      }
      return state;
    })
  );

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  protected readonly ADDRESS_TYPE = ADDRESS_TYPE;

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
    private readonly platformConfigurationService: PlatformConfigurationService
  ) {}

  public backToForm(): void {
    this.tradePageService.setState('form');
    this.previewSwapService.setNextTxState({
      step: 'idle',
      data: {
        wrongNetwork: this.previewSwapService.transactionState.data?.wrongNetwork,
        activeWallet: this.previewSwapService.transactionState.data?.activeWallet
      }
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
}
