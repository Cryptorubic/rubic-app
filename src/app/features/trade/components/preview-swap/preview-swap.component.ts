import { ChangeDetectionStrategy, Component, Inject, Injector, OnDestroy } from '@angular/core';
import { combineLatestWith, firstValueFrom, forkJoin, Observable, of } from 'rxjs';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { TransactionStateComponent } from '@features/trade/components/transaction-state/transaction-state.component';
import { first, map, startWith, switchMap } from 'rxjs/operators';
import { transactionStep } from '@features/trade/models/transaction-steps';
import {
  BlockchainsInfo,
  CrossChainTradeType,
  EvmBlockchainName,
  EvmCrossChainTrade,
  EvmOnChainTrade,
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
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { BLOCKCHAIN_NAME } from 'rubic-sdk/lib/core/blockchain/models/blockchain-name';
import { AuthService } from '@app/core/services/auth/auth.service';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { TransactionState } from '@features/trade/models/transaction-state';
import { tuiIsPresent } from '@taiga-ui/cdk';
import { mevBotSupportedBlockchains } from '../../services/preview-swap/models/mevbot-data';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { isArbitrumBridgeRbcTrade } from '../../utils/is-arbitrum-bridge-rbc-trade';

@Component({
  selector: 'app-preview-swap',
  templateUrl: './preview-swap.component.html',
  styleUrls: ['./preview-swap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewSwapComponent implements OnDestroy {
  protected readonly SWAP_PROVIDER_TYPE = SWAP_PROVIDER_TYPE;

  public readonly tradeInfo$ = this.previewSwapService.tradeInfo$;

  public readonly nativeToken$ = this.swapsFormService.nativeToken$;

  public readonly isMonadTrade$ = this.previewSwapService.selectedTradeState$.pipe(
    map(
      tradeState =>
        tradeState.trade.from.blockchain === BLOCKCHAIN_NAME.MONAD_TESTNET ||
        tradeState.trade.to.blockchain === BLOCKCHAIN_NAME.MONAD_TESTNET
    )
  );

  public readonly isMevBotProtectedChains$: Observable<boolean> =
    this.swapsFormService.fromBlockchain$.pipe(
      map(chain => mevBotSupportedBlockchains.some(mevBotChain => mevBotChain === chain))
    );

  public readonly tradeState$: Observable<SelectedTrade & { feeInfo: FeeInfo }> =
    this.previewSwapService.selectedTradeState$.pipe(
      first(tuiIsPresent),
      map(tradeState => {
        const info = tradeState.trade.getTradeInfo();
        return {
          ...tradeState,
          feeInfo: info?.feeInfo
        };
      })
    );

  public readonly transactionState$ = this.previewSwapService.transactionState$;

  public readonly buttonState$ = this.transactionState$.pipe(
    combineLatestWith(this.tradeState$.pipe(first()), this.swapsStateService.notEnoughBalance$),
    switchMap(states => this.getState(...states)),
    startWith({
      action: () => {},
      label: 'Select Tokens',
      disabled: true
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
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly authService: AuthService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapsStateService: SwapsStateService
  ) {
    this.previewSwapService.setSelectedProvider();
    this.previewSwapService.activatePage();
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

  private logoutAndChangeWallet(): void {
    this.authService.disconnectWallet();
    this.gtmService.fireClickOnConnectWalletButtonEvent();
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  private async switchChain(): Promise<void> {
    const blockchain = this.swapsFormService.inputValue.fromBlockchain;
    const switched = await this.walletConnector.switchChain(blockchain as EvmBlockchainName);
    if (switched) {
      await this.previewSwapService.requestTxSign();
    }
  }

  private isTradeWithPermit2Approve(tradeState: SelectedTrade): boolean {
    return (
      tradeState.trade instanceof EvmOnChainTrade &&
      tradeState.trade.permit2ApproveConfig.usePermit2Approve
    );
  }

  private connectWallet(): void {
    this.modalService
      .openWalletModal(this.injector)
      .pipe(
        switchMap(() =>
          forkJoin([this.walletConnector.addressChange$, this.swapsStateService.notEnoughBalance$])
        ),
        switchMap(([address, balanceError]) =>
          Boolean(address) && !balanceError ? this.previewSwapService.requestTxSign() : of(null)
        )
      )
      .subscribe();
  }

  public getAverageTime(tradeState: SelectedTrade & { feeInfo: FeeInfo }): string {
    if (tradeState?.tradeType) {
      if (isArbitrumBridgeRbcTrade(tradeState.trade)) {
        return '7 D';
      }
      const provider = TRADES_PROVIDERS[tradeState.tradeType];
      const providerAverageTime = this.platformConfigurationService.providersAverageTime;
      const currentProviderTime =
        providerAverageTime?.[tradeState.tradeType as CrossChainTradeType];

      return currentProviderTime ? `${currentProviderTime} M` : `${provider.averageTime} M`;
    } else {
      return tradeState instanceof CrossChainTrade ? '30 M' : '3 M';
    }
  }

  public getGasData(
    trade: CrossChainTrade | OnChainTrade
  ): { amount: BigNumber; amountInUsd: BigNumber; symbol: string } | null {
    let gasData = null;
    let gasPrice = null;
    if (trade instanceof EvmCrossChainTrade) {
      gasData = trade.gasData;

      if (
        trade.from.blockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
        trade.from.blockchain !== BLOCKCHAIN_NAME.FANTOM
      ) {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? Web3Pure.fromWei(gasData.gasPrice)
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      } else {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? gasData.gasPrice
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      }
    } else if (trade instanceof EvmOnChainTrade) {
      gasData = trade.gasFeeInfo;
      gasPrice = gasData?.gasPrice?.gt(0) ? gasData.gasPrice : gasData?.maxFeePerGas;
    }

    if (!gasData || !gasData.gasLimit) {
      return null;
    }
    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const nativeTokenPrice = this.tokensStoreService.tokens.find(token =>
      compareTokens(token, { blockchain, address: nativeToken.address })
    ).price;
    const gasLimit = gasData?.gasLimit?.multipliedBy(gasPrice);

    return {
      amount: gasLimit,
      amountInUsd: gasLimit.multipliedBy(nativeTokenPrice),
      symbol: nativeToken.symbol
    };
  }

  // eslint-disable-next-line complexity
  private async getState(
    el: TransactionState,
    tradeState: SelectedTrade,
    balanceError: boolean
  ): Promise<{ action: () => void; label: string; disabled: boolean }> {
    const isCrossChain =
      this.swapsFormService.inputValue.fromBlockchain !==
      this.swapsFormService.inputValue.toBlockchain;

    const fromBlockchain = this.swapsFormService.inputValue.fromBlockchain;
    const fromBlockchainType = BlockchainsInfo.getChainType(fromBlockchain);

    const state = {
      action: (): void => {},
      label: TransactionStateComponent.getLabel(el.step, isCrossChain ? 'bridge' : 'swap'),
      disabled: true
    };
    if (el.step === transactionStep.approveReady) {
      state.disabled = false;
      state.label = this.isTradeWithPermit2Approve(tradeState) ? 'Approve and Permit' : state.label;
      state.action = this.approve.bind(this);
    } else if (el.step === transactionStep.swapReady) {
      state.disabled = false;
      state.action = this.swap.bind(this);
    } else if (el.step === transactionStep.idle) {
      state.disabled = false;
      state.action = this.startTrade.bind(this);
    } else if (
      el.step === transactionStep.success ||
      el.step === transactionStep.destinationPending
    ) {
      state.disabled = false;
      state.label = 'Done';
      state.action = this.backToForm.bind(this);
    }

    if (
      (el.data.wrongNetwork &&
        !BlockchainsInfo.isEvmBlockchainName(fromBlockchain) &&
        el.step !== transactionStep.success) ||
      fromBlockchainType !== this.walletConnector.chainType
    ) {
      state.disabled = false;
      state.action = () => this.logoutAndChangeWallet();
      state.label = 'Change Wallet';
    }

    if (
      el.data?.wrongNetwork &&
      (el.step === transactionStep.approvePending ||
        el.step === transactionStep.approveReady ||
        el.step === transactionStep.swapRequest ||
        el.step === transactionStep.swapReady ||
        el.step === transactionStep.idle) &&
      BlockchainsInfo.isEvmBlockchainName(fromBlockchain) &&
      fromBlockchainType === this.walletConnector.chainType
    ) {
      state.disabled = false;
      state.action = () => this.switchChain();
      state.label = `Change network`;
    }
    if (el.data?.activeWallet === false) {
      state.disabled = false;
      state.action = () => this.connectWallet();
      state.label = `Connect wallet`;
    }
    if (tradeState?.error) {
      state.disabled = true;
      state.action = () => {};
      state.label = tradeState.error.message;
    }
    if (
      balanceError &&
      el.step !== transactionStep.success &&
      el.step !== transactionStep.destinationPending
    ) {
      state.disabled = true;
      state.action = () => {};
      state.label = 'Insufficient funds';
    }
    if (
      (el.step === transactionStep.idle || el.step === transactionStep.swapReady) &&
      !isCrossChain &&
      tradeState?.trade?.type === ON_CHAIN_TRADE_TYPE.WRAPPED
    ) {
      const fromTokenAddress = this.swapsFormService.inputValue.fromToken.address;
      const nativeTokenAddress = nativeTokensList[fromBlockchain].address;
      const isWrap = compareAddresses(fromTokenAddress, nativeTokenAddress);
      state.label = isWrap ? 'Wrap' : 'Unwrap';
    }
    return state;
  }

  public ngOnDestroy() {
    this.previewSwapService.deactivatePage();
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
