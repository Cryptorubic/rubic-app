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
  EvmBlockchainName,
  nativeTokensList,
  ON_CHAIN_TRADE_TYPE
} from '@cryptorubic/core';
import { Router } from '@angular/router';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ModalService } from '@core/modals/services/modal.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { HeaderStore } from '@core/header/services/header.store';
import { compareAddresses } from '@shared/utils/utils';
import { AuthService } from '@app/core/services/auth/auth.service';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';
import { TransactionState } from '@features/trade/models/transaction-state';
import { mevBotSupportedBlockchains } from '../../services/preview-swap/models/mevbot-data';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { isArbitrumBridgeRbcTrade } from '../../utils/is-arbitrum-bridge-rbc-trade';
import { TradeInfoManager } from '../../services/trade-info-manager/trade-info-manager.service';
import { AppGasData } from '../../models/provider-info';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { EvmOnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OnChainTrade } from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/on-chain-trade';
import { FeeInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { isNearIntentsTrade } from '../../utils/is-near-intents-trade';

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

  public readonly isMevBotProtectedChains$: Observable<boolean> =
    this.swapsFormService.fromBlockchain$.pipe(
      map(chain => mevBotSupportedBlockchains.some(mevBotChain => mevBotChain === chain))
    );

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
    private readonly authService: AuthService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapsStateService: SwapsStateService,
    private readonly tradeInfoManager: TradeInfoManager
  ) {
    this.previewSwapService.setSelectedProvider();
    this.previewSwapService.activatePage();
  }

  public backToForm(): void {
    this.previewSwapService.backToForm();
  }

  public async startTrade(): Promise<void> {
    await this.previewSwapService.requestTxSign();
  }

  public continueBackupSwap(allowedToContinue: boolean = true): void {
    this.previewSwapService.continueBackupSwap(allowedToContinue);
  }

  public async swap(): Promise<void> {
    this.previewSwapService.startSwap();
  }

  public async approve(): Promise<void> {
    await this.previewSwapService.startApprove();
  }

  public authWallet(): void {
    this.previewSwapService.startAuthWallet();
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

  public getAverageTimeString(tradeState: SelectedTrade & { feeInfo: FeeInfo }): string {
    if (tradeState?.tradeType) {
      if (isArbitrumBridgeRbcTrade(tradeState.trade)) return '7 days';
      if (isNearIntentsTrade(tradeState.trade)) return '10+ mins';
      const time = this.tradeInfoManager.getAverageSwapTimeMinutes(tradeState.trade);
      return `${time.averageTimeMins} ${time.averageTimeMins > 1 ? 'mins' : 'min'}`;
    } else {
      return tradeState instanceof CrossChainTrade ? '30 mins' : '1 min';
    }
  }

  public getTime95PercentsSwapsString(tradeState: SelectedTrade & { feeInfo: FeeInfo }): string {
    if (tradeState?.tradeType) {
      if (isArbitrumBridgeRbcTrade(tradeState.trade)) return '7 days';
      if (isNearIntentsTrade(tradeState.trade)) return '10+ minutes';
      const time = this.tradeInfoManager.getAverageSwapTimeMinutes(tradeState.trade);
      return `${time.time95PercentsSwapsMins} ${
        time.time95PercentsSwapsMins > 1 ? 'minutes' : 'minute'
      }`;
    } else {
      return tradeState instanceof CrossChainTrade ? '30 mins' : '1 min';
    }
  }

  public getGasData(trade: CrossChainTrade | OnChainTrade): AppGasData | null {
    return this.tradeInfoManager.getGasData(trade);
  }

  // eslint-disable-next-line complexity
  private async getState(
    el: TransactionState,
    tradeState: SelectedTrade,
    balanceError: boolean
  ): Promise<{ action: () => void; label: string; disabled: boolean; needTrustline: boolean }> {
    const isCrossChain =
      this.swapsFormService.inputValue.fromBlockchain !==
      this.swapsFormService.inputValue.toBlockchain;

    const fromBlockchain = this.swapsFormService.inputValue.fromBlockchain;
    const fromBlockchainType = BlockchainsInfo.getChainType(fromBlockchain);

    const state = {
      action: (): void => {},
      label: TransactionStateComponent.getLabel(el.step, isCrossChain ? 'bridge' : 'swap'),
      disabled: true,
      needTrustline: false
    };
    if (el.data.needTrustline) {
      state.needTrustline = true;
    }
    if (el.step === transactionStep.approveReady) {
      state.disabled = false;
      state.label = this.isTradeWithPermit2Approve(tradeState) ? 'Approve and Permit' : state.label;
      state.action = this.approve.bind(this);
    } else if (el.step === transactionStep.swapReady) {
      state.disabled = false;
      state.action = this.swap.bind(this);
    } else if (el.step === transactionStep.swapRetry) {
      state.disabled = true;
      state.action = () => {};
    } else if (el.step === transactionStep.swapBackupSelected) {
      state.disabled = false;
      state.action = this.continueBackupSwap.bind(this);
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
    } else if (el.step === transactionStep.authWalletReady) {
      state.disabled = false;
      state.action = this.authWallet.bind(this);
    } else if (el.step === transactionStep.error) {
      state.disabled = false;
      state.label = 'Back to form';
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
