import { Injectable } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import { HinkalSwapService } from './hinkal-swap.service';
import { HinkalBalanceService } from './hinkal-balance.service';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  skip,
  Subscription,
  switchMap,
  timer
} from 'rxjs';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainName,
  BlockchainsInfo,
  compareAddresses,
  EvmBlockchainName,
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
import { HinkalSwapTokensFacadeService } from '../token-facades/hinkal-swap-tokens-facade.service';
import { HINKAL_SUPPORTED_GAS_TOKENS } from '../../constants/hinkal-supported-gas-tokens';
import { getEmptySwapFormInput } from '@app/features/privacy/utils/empty-swap-form-input';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';
import {
  HINKAL_PRIVATE_OPERATION,
  HinkalPrivateOperation
} from '../../constants/hinkal-private-operations';
import { FeeStructure } from '@hinkal/common';
import { donePrivateStep } from '@features/privacy/providers/shared-privacy-providers/components/private-preview-swap/constants/done-private-step';

@Injectable()
export class HinkalFacadeService {
  private readonly subs: Subscription[] = [];

  private readonly _activeChain$ = new BehaviorSubject<BlockchainName | null>(null);

  private readonly _balanceLoading$ = new BehaviorSubject<boolean>(false);

  public readonly balanceLoading$ = this._balanceLoading$.asObservable();

  private readonly _estimatedFeeMapping: Partial<Record<BlockchainName, FeeStructure[]>> = {};

  public getEstimatedFeesByChain(blockchain: BlockchainName): FeeStructure[] {
    return this._estimatedFeeMapping[blockchain] || [];
  }

  private async updateActiveChainFees(blockchain: BlockchainName): Promise<void> {
    try {
      const supportedTokens = PRIVATE_MODE_SUPPORTED_TOKENS[blockchain];

      const estimatedFees = await Promise.all(
        supportedTokens.map(token =>
          this.hinkalSwapService.estimateFee({
            fromToken: {
              address: token,
              blockchain
            },
            operation: HINKAL_PRIVATE_OPERATION.TRANSFER,
            feeTokenAddress: token
          })
        )
      );

      this._estimatedFeeMapping[blockchain] = supportedTokens.map((_, i) => estimatedFees[i]);
    } catch (err) {
      console.log(err);
    }
  }

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
    private readonly tokensFacade: TokensFacadeService,
    private readonly privateTokensFacade: HinkalSwapTokensFacadeService
  ) {}

  public initSubs(): void {
    const activeNetworkSub = this.subscribeOnActiveNetworkChanged();
    const pollSub = this.hinkalBalanceService.initBalanceEvent().subscribe();
    const balanceSub = this.hinkalBalanceService
      .subscribeOnBalanceEvent()
      .pipe(filter(chainId => chainId === blockchainId[this._activeChain$.value]))
      .subscribe(() => this._balanceLoading$.next(false));

    const instanceSub = this.subscribeOnInstanceChanged();
    const estimateFeeSub = this.activeChain$
      .pipe(
        filter(Boolean),
        switchMap(aciveChain =>
          timer(0, 120_000).pipe(switchMap(() => this.updateActiveChainFees(aciveChain)))
        )
      )
      .subscribe();

    this.subs.push(activeNetworkSub, pollSub, balanceSub, instanceSub, estimateFeeSub);
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
        showLoaderOnAction: false,
        action: () => this.walletConnectorService.switchChain(fromBlockchain).then(() => ({}))
      });
    }
  }

  private async getGasTokens(fromToken: TokenAmount): Promise<BalanceToken[]> {
    try {
      const tokens = await firstValueFrom(
        this.privateTokensFacade.getTokensList(
          fromToken.blockchain,
          '',
          'from',
          getEmptySwapFormInput()
        )
      );

      return tokens.filter(fetchedToken => {
        const gasTokens = HINKAL_SUPPORTED_GAS_TOKENS[fetchedToken.blockchain] || [];

        return gasTokens.some(
          gasToken =>
            compareAddresses(gasToken, fetchedToken.address) ||
            compareAddresses(fromToken.address, fetchedToken.address)
        );
      });
    } catch {
      return [];
    }
  }

  public async prepareDepositSteps(token: TokenAmount<EvmBlockchainName>): Promise<PrivateStep[]> {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(token.blockchain, steps);

    const needApprove = await this.hinkalSwapService.needApproveBeforeShield(token);

    steps.push({
      label: 'Shield Tokens',
      showLoaderOnAction: true,
      action: async () => {
        if (needApprove) {
          await this.hinkalSwapService.approveBeforeShield(token);
        }

        return this.hinkalSwapService.deposit(token).then(res => {
          this.privateStatisticsService.saveAction(
            'SHIELD',
            'HINKAL',
            this.walletConnectorService.address,
            token.address,
            token.weiAmount.toFixed(),
            token.blockchain
          );
          this.privateLocalStorageService.markProviderAsShielded(PRIVATE_TRADE_TYPE.HINKAL);
          this.tokensFacade.getAndUpdateTokenBalance(token).then(balance => {
            this.hideWindowService.setHideAsset({
              ...this.hideWindowService.hideAsset,
              amount: balance
            });
          });
          return res;
        });
      }
    });
    steps.push(donePrivateStep());

    return steps;
  }

  public prepareWithdrawSteps(
    token: TokenAmount<EvmBlockchainName>,
    getSelectedGasToken: () => string,
    receiver?: string
  ): PrivateStep[] {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(token.blockchain, steps);

    steps.push({
      label: 'Private Transfer',
      showLoaderOnAction: true,
      action: () => {
        const selectedGasToken = getSelectedGasToken();
        const estimatedFee = this.getEstimatedFeesByChain(token.blockchain).find(({ feeToken }) =>
          compareAddresses(feeToken, selectedGasToken)
        );

        return this.hinkalSwapService
          .withdraw(token, selectedGasToken, estimatedFee, receiver)
          .then(res => {
            this.privateStatisticsService.saveAction(
              'TRANSFER',
              'HINKAL',
              this.walletConnectorService.address,
              token.address,
              token.weiAmount.toFixed(),
              token.blockchain
            );
            return res;
          });
      }
    });
    steps.push(donePrivateStep());

    return steps;
  }

  public prepareTransferSteps(
    token: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey: string,
    getSelectedGasToken: () => string
  ): PrivateStep[] {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(token.blockchain, steps);

    steps.push({
      label: 'Transfer tokens',
      showLoaderOnAction: true,
      action: () => {
        const selectedGasToken = getSelectedGasToken();
        return this.hinkalSwapService
          .privateTransfer(token, receiverPrivateShieldedKey, selectedGasToken)
          .then(res => {
            this.privateStatisticsService.saveAction(
              'TRANSFER',
              'HINKAL',
              this.walletConnectorService.address,
              token.address,
              token.weiAmount.toFixed(),
              token.blockchain
            );
            return res;
          });
      }
    });
    steps.push(donePrivateStep());

    return steps;
  }

  public async prepareGasTokens(
    fromToken: TokenAmount<EvmBlockchainName>,
    _operation: HinkalPrivateOperation,
    _toToken?: TokenAmount<EvmBlockchainName>
  ): Promise<GasToken[]> {
    const availableGasTokens = await this.getGasTokens(fromToken);

    // const estimates = await Promise.all(
    //   availableGasTokens.map(async token => ({
    //     ...token,
    //     estimatedFee: await this.hinkalSwapService.estimateFee({
    //       feeTokenAddress: token.address,
    //       fromToken,
    //       toToken,
    //       operation
    //     })
    //   }))
    // );

    const fees = this.getEstimatedFeesByChain(fromToken.blockchain);

    const estimates = availableGasTokens.map(token => {
      const fee = fees.find(({ feeToken }) => compareAddresses(feeToken, token.address));

      return {
        ...token,
        estimatedFee: new BigNumber(fee?.flatFee?.toString() || 0)
      };
    });
    return estimates.map(({ estimatedFee, ...token }) => {
      const feeAmount = Token.fromWei(estimatedFee, token.decimals);
      const gasFeeUsd = feeAmount.multipliedBy(token.price);

      return {
        ...token,
        gasFee: feeAmount.decimalPlaces(6, BigNumber.ROUND_HALF_UP),
        gasFeeUsd: gasFeeUsd.decimalPlaces(2, BigNumber.ROUND_HALF_UP)
      };
    });
  }

  public prepareSwapSteps(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>,
    getSelectedGasToken: () => string
  ): PrivateStep[] {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(fromToken.blockchain, steps);

    steps.push({
      label: 'Swap',
      showLoaderOnAction: true,
      action: () => {
        const selectedGasToken = getSelectedGasToken();
        console.log(`SELECTED GAS TOKEN`, selectedGasToken);

        return this.hinkalSwapService
          .privateSwap(fromToken, toToken, selectedGasToken)
          .then(res => {
            this.privateStatisticsService.saveAction(
              'PRIVATE_ONCHAIN_SWAP',
              'HINKAL',
              this.walletConnectorService.address,
              fromToken.address,
              fromToken.weiAmount.toFixed(),
              fromToken.blockchain
            );
            return res;
          });
      }
    });
    steps.push(donePrivateStep());

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
        this.privatePageTypeService.activePage = { type: 'hide', label: 'Shield Tokens' };
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
      .pipe(filter(Boolean), distinctUntilChanged())
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
