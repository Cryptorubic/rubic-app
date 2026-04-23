import { Injectable } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import { HinkalSwapService } from './hinkal-swap.service';
import { HinkalBalanceService } from './hinkal-balance.service';
import { BehaviorSubject, distinctUntilChanged, filter, skip, Subscription, switchMap } from 'rxjs';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  nativeTokensList,
  Token,
  TokenAmount
} from '@cryptorubic/core';
import { HinkalWorkerService } from './hinkal-worker.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { AssetListType } from '@app/features/trade/models/asset';
import { PrivateStep } from '../../../shared-privacy-providers/components/private-preview-swap/models/preview-swap-options';
import { PrivatePageTypeService } from '../../../shared-privacy-providers/services/private-page-type/private-page-type.service';
import { PrivateStatisticsService } from '../../../shared-privacy-providers/services/private-statistics/private-statistics.service';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { HideWindowService } from '../../../shared-privacy-providers/services/hide-window-service/hide-window.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import BigNumber from 'bignumber.js';
import { GasToken } from '@app/shared/models/tokens/gas-token';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';

@Injectable()
export class HinkalFacadeService {
  private readonly subs: Subscription[] = [];

  private readonly _activeChain$ = new BehaviorSubject<BlockchainName | null>(null);

  private readonly _balanceLoading$ = new BehaviorSubject<boolean>(false);

  public readonly balanceLoading$ = this._balanceLoading$.asObservable();

  public switchChain(asset: AssetListType): void {
    const isChain = BlockchainsInfo.isBlockchainName(asset);

    this._activeChain$.next(
      isChain && HINKAL_SUPPORTED_CHAINS.includes(asset as EvmBlockchainName)
        ? asset
        : BLOCKCHAIN_NAME.ETHEREUM
    );
  }

  public readonly activeChain$ = this._activeChain$.asObservable();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly hinkalSwapService: HinkalSwapService,
    private readonly hinkalBalanceService: HinkalBalanceService,
    private readonly hinkalWorkerService: HinkalWorkerService,
    private readonly notificationService: NotificationsService,
    private readonly privateLocalStorageService: PrivateLocalStorageService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly privateStatisticsService: PrivateStatisticsService,
    private readonly hideWindowService: HideWindowService,
    private readonly tokensFacade: TokensFacadeService
  ) {}

  public initSubs(): void {
    const activeNetworkSub = this.subscribeOnActiveNetworkChanged();
    const pollSub = this.hinkalBalanceService.initBalanceEvent().subscribe();
    const balanceSub = this.hinkalBalanceService
      .subscribeOnBalanceEvent()
      .pipe(filter(chainId => chainId === blockchainId[this._activeChain$.value]))
      .subscribe(() => this._balanceLoading$.next(false));

    const instanceSub = this.subscribeOnInstanceChanged();

    this.subs.push(activeNetworkSub, pollSub, balanceSub, instanceSub);
  }

  private showSuccessNotification(message: string): void {
    this.notificationService.show(message, {
      status: 'info',
      autoClose: 15_000,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  private addSwitchNetworkStep(fromBlockchain: EvmBlockchainName, steps: PrivateStep[]): void {
    if (fromBlockchain !== this.walletConnectorService.network) {
      steps.push({
        label: 'Switch network',
        action: () => this.walletConnectorService.switchChain(fromBlockchain)
      });
    }
  }

  public async prepareDepositSteps(token: TokenAmount<EvmBlockchainName>): Promise<PrivateStep[]> {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(token.blockchain, steps);

    const needApprove = await this.hinkalSwapService.needApproveBeforeShield(token);

    if (needApprove) {
      steps.push({
        label: 'Approve',
        action: () => this.hinkalSwapService.approveBeforeShield(token)
      });
    }

    steps.push({
      label: 'Shield',
      action: () =>
        this.hinkalSwapService.deposit(token).then(isSuccess => {
          if (isSuccess) {
            this.privateStatisticsService.saveAction(
              'SHIELD',
              'HINKAL',
              this.walletConnectorService.address,
              token.address,
              token.weiAmount.toFixed(),
              token.blockchain
            );
            this.showSuccessNotification('Transaction sent. 5-10 seconds on update balance');
            this.privateLocalStorageService.markProviderAsShielded(PRIVATE_TRADE_TYPE.HINKAL);
            this.tokensFacade.getAndUpdateTokenBalance(token).then(balance => {
              this.hideWindowService.setHideAsset({
                ...this.hideWindowService.hideAsset,
                amount: balance
              });
            });
          }
        })
    });

    return steps;
  }

  public prepareWithdrawSteps(
    token: TokenAmount<EvmBlockchainName>,
    receiver?: string
  ): PrivateStep[] {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(token.blockchain, steps);

    steps.push({
      label: 'Unshield',
      action: () => {
        return this.hinkalSwapService.withdraw(token, receiver).then(isSuccess => {
          if (isSuccess) {
            this.privateStatisticsService.saveAction(
              'UNSHIELD',
              'HINKAL',
              this.walletConnectorService.address,
              token.address,
              token.weiAmount.toFixed(),
              token.blockchain
            );
            this.showSuccessNotification(
              'Transaction sent. This may take a moment. Please keep Rubic App open'
            );
          }
        });
      }
    });

    return steps;
  }

  public prepareTransferSteps(
    token: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey: string
  ): PrivateStep[] {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(token.blockchain, steps);

    steps.push({
      label: 'Transfer tokens',
      action: () => {
        return this.hinkalSwapService
          .privateTransfer(token, receiverPrivateShieldedKey)
          .then(isSuccess => {
            if (isSuccess) {
              this.privateStatisticsService.saveAction(
                'TRANSFER',
                'HINKAL',
                this.walletConnectorService.address,
                token.address,
                token.weiAmount.toFixed(),
                token.blockchain
              );
              this.showSuccessNotification(
                'Transaction sent. This may take a moment. Please keep Rubic App open'
              );
            }
          });
      }
    });

    return steps;
  }

  private async estimateGas(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>,
    feeToken: BalanceToken
  ): Promise<BigNumber> {
    const result = await this.hinkalSwapService.estimateGas(fromToken, toToken, feeToken);
    console.log(`GAS ESTIMATE RESPONSE FOR ${feeToken.blockchain}.${feeToken.symbol} = ${result}`);

    return result;
  }

  public async prepareGasTokens(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>,
    availableGasTokens: BalanceToken[]
  ): Promise<GasToken[]> {
    const estimates = await Promise.all(
      availableGasTokens.map(async token => ({
        ...token,
        gasLimit: await this.estimateGas(fromToken, toToken, token)
      }))
    );

    const gasPriceInNativeToken = await this.hinkalSwapService.getGasPrice();

    const nativeToken = nativeTokensList[fromToken.blockchain];
    const nativeTokenPrice = this.tokensFacade.findTokenSync(nativeToken)?.price ?? 0;

    return estimates
      .map(({ gasLimit, ...token }) => {
        const gasFeeWeiNative = gasLimit.multipliedBy(gasPriceInNativeToken);
        const gasFeeNative = Token.fromWei(gasFeeWeiNative, nativeToken.decimals);
        const gasFeeUsd = gasFeeNative.multipliedBy(nativeTokenPrice);
        const gasFee = token.price ? gasFeeUsd.dividedBy(token.price) : new BigNumber(0);
        const gasFeeWei = new BigNumber(Token.toWei(gasFee, token.decimals));

        return { ...token, gasFee: gasFeeWei, gasFeeUsd };
      })
      .filter(token => token.amount.gt(token.gasFee));
  }

  public prepareSwapSteps(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>,
    getSelectedGasToken?: () => GasToken | undefined
  ): PrivateStep[] {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(fromToken.blockchain, steps);

    steps.push({
      label: 'Swap',
      action: () => {
        const selectedGasToken = getSelectedGasToken?.();
        console.log(`SELECTED GAS TOKEN`, selectedGasToken);

        return this.hinkalSwapService
          .privateSwap(fromToken, toToken, selectedGasToken)
          .then(isSuccess => {
            if (isSuccess) {
              this.privateStatisticsService.saveAction(
                'PRIVATE_ONCHAIN_SWAP',
                'HINKAL',
                this.walletConnectorService.address,
                fromToken.address,
                fromToken.weiAmount.toFixed(),
                fromToken.blockchain
              );
              this.showSuccessNotification(
                'Transaction sent. This may take a moment. Please keep Rubic App open'
              );
            }
          });
      }
    });

    return steps;
  }

  public logout(): void {
    this.hinkalInstanceService.resetInstance();
  }

  public async updateInstance(): Promise<void> {
    try {
      if (!this.walletConnectorService.address) {
        this.notificationService.showWarning('Wallet not connected');
        return;
      }

      const isSuccess = await this.hinkalInstanceService.updateInstance(
        this.walletConnectorService.address,
        (this._activeChain$.value || BLOCKCHAIN_NAME.ETHEREUM) as EvmBlockchainName
      );

      if (isSuccess) {
        this.privatePageTypeService.activePage = { type: 'walletInfo', label: 'Wallet' };
      }
    } catch {}
  }

  private subscribeOnActiveNetworkChanged(): Subscription {
    return this.activeChain$
      .pipe(
        filter(Boolean),
        skip(1),
        distinctUntilChanged(),
        switchMap(chain => {
          this._balanceLoading$.next(true);
          return this.hinkalWorkerService
            .request<void>({
              params: {
                chainId: blockchainId[chain],
                address: this.walletConnectorService.address
              },
              type: 'switchNetwork'
            })
            .then(() => this.hinkalBalanceService.updateBalance());
        })
      )
      .subscribe();
  }

  private subscribeOnInstanceChanged(): Subscription {
    return this.hinkalInstanceService.currSignature$
      .pipe(
        distinctUntilChanged(),
        filter(signature => signature && !this._balanceLoading$.value)
      )
      .subscribe(() => {
        this._balanceLoading$.next(true);
        this.hinkalBalanceService.updateBalance();
      });
  }

  private removeSubs(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private resetChain(): void {
    this._activeChain$.next(null);
  }

  private stopWorkerEvents(): Promise<void> {
    return this.hinkalInstanceService.clearSnapshotsInterval();
  }

  public resetState(): void {
    this.removeSubs();
    this.resetChain();
    this.stopWorkerEvents();
  }
}
