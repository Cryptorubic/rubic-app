import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { SHOULD_CALCULATE_GAS_BLOCKCHAIN } from '@features/instant-trade/services/instant-trade-service/constants/should-calculate-gas-blockchain';
import { SuccessTxModalService } from 'src/app/features/swaps/services/success-tx-modal-service/success-tx-modal.service';
import { GoogleTagManagerService } from 'src/app/core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { IframeService } from '@core/services/iframe/iframe.service';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { TransactionReceipt } from 'web3-eth';
import {
  IT_PROXY_FEE_CONTRACT_ABI,
  IT_PROXY_FEE_CONTRACT_ADDRESS,
  IT_PROXY_FEE_CONTRACT_METHOD
} from '@features/instant-trade/services/instant-trade-service/constants/iframe-fee-contract/instant-trades-proxy-fee-contract';
import { InstantTradeProvidersService } from '@features/instant-trade/services/instant-trade-service/instant-trade-providers.service';
import { Providers } from '@features/instant-trade/services/instant-trade-service/models/providers';
import { EthWethSwapProviderService } from '@features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/eth-weth-swap-provider.service';

@Injectable({
  providedIn: 'root'
})
export class InstantTradeService {
  private static readonly unsupportedItNetworks = [BLOCKCHAIN_NAME.XDAI];

  public static isSupportedBlockchain(blockchain: BLOCKCHAIN_NAME): boolean {
    return !InstantTradeService.unsupportedItNetworks.includes(blockchain);
  }

  private readonly providers: Providers;

  constructor(
    private readonly instantTradeProvidersService: InstantTradeProvidersService,
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly ethWethSwapProvider: EthWethSwapProviderService,
    private readonly iframeService: IframeService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapFormService: SwapFormService,
    private readonly notificationsService: NotificationsService,
    private readonly successTxModalService: SuccessTxModalService,
    private readonly web3PrivateService: EthLikeWeb3PrivateService
  ) {
    this.providers = this.instantTradeProvidersService.providers;
  }

  public getAllowance(providersNames: INSTANT_TRADE_PROVIDER[]): Observable<boolean[]> | never {
    const { fromToken, fromAmount, fromBlockchain } = this.swapFormService.inputValue;

    const providers = providersNames.map(
      providerName => this.providers[fromBlockchain][providerName]
    );
    const providerApproveData = providers.map((provider: ItProvider) => {
      const targetContractAddress = this.iframeService.isIframeWithFee(
        fromBlockchain,
        provider.providerType
      )
        ? IT_PROXY_FEE_CONTRACT_ADDRESS
        : undefined;

      return provider.getAllowance(fromToken.address, targetContractAddress).pipe(
        catchError((err: unknown) => {
          console.debug(err, provider);
          return of(null);
        })
      );
    });

    return forkJoin(providerApproveData).pipe(
      map((allowances: BigNumber[]) => {
        return allowances.map(allowance => fromAmount.gt(allowance));
      })
    );
  }

  public async approve(provider: INSTANT_TRADE_PROVIDER, trade: InstantTrade): Promise<void> {
    this.checkDeviceAndShowNotification();

    try {
      const { fromBlockchain } = this.swapFormService.inputValue;
      const targetContractAddress = this.iframeService.isIframeWithFee(fromBlockchain, provider)
        ? IT_PROXY_FEE_CONTRACT_ADDRESS
        : undefined;

      let subscription$: Subscription;
      await this.providers[trade.blockchain][provider].approve(
        trade.from.token.address,
        {
          onTransactionHash: () => {
            subscription$ = this.notificationsService.showApproveInProgress();
          }
        },
        targetContractAddress
      );
      subscription$?.unsubscribe();

      this.notificationsService.showApproveSuccessful();
    } catch (err) {
      throw err;
    }
  }

  public getEthWethTrade(): InstantTrade | null {
    const { fromAmount, fromToken, toToken, fromBlockchain } = this.swapFormService.inputValue;

    if (
      !fromToken ||
      !toToken ||
      !this.ethWethSwapProvider.isEthAndWethSwap(fromBlockchain, fromToken.address, toToken.address)
    ) {
      return null;
    }

    return {
      blockchain: fromBlockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: fromAmount
      }
    };
  }

  public async calculateTrades(
    providersNames: INSTANT_TRADE_PROVIDER[]
  ): Promise<PromiseSettledResult<InstantTrade>[]> {
    const { fromAmount, fromToken, toToken, fromBlockchain } = this.swapFormService.inputValue;

    const providers = providersNames.map(
      providerName => this.providers[fromBlockchain][providerName]
    );
    const shouldCalculateGas =
      SHOULD_CALCULATE_GAS_BLOCKCHAIN[
        fromBlockchain as keyof typeof SHOULD_CALCULATE_GAS_BLOCKCHAIN
      ];
    const providersDataPromises = providers.map(provider =>
      provider.calculateTrade(fromToken, fromAmount, toToken, shouldCalculateGas)
    );

    return Promise.allSettled(providersDataPromises);
  }

  public async createTrade(
    providerName: INSTANT_TRADE_PROVIDER,
    trade: InstantTrade,
    confirmCallback?: () => void
  ): Promise<void> {
    this.checkDeviceAndShowNotification();

    let transactionHash: string;
    const options = {
      onConfirm: async (hash: string) => {
        transactionHash = hash;

        confirmCallback?.();

        this.notifyGtmAfterSignTx(transactionHash);
        this.gtmService.checkGtm();

        this.successTxModalService.open(transactionHash, trade.blockchain);

        if (this.iframeService.isIframeWithFee(trade.blockchain, providerName)) {
          await this.postTrade(
            hash,
            providerName,
            trade,
            this.iframeService.feeData.fee,
            this.iframeService.promoCode
          );
        } else {
          await this.postTrade(hash, providerName, trade);
        }
      }
    };

    try {
      let receipt;
      if (providerName === INSTANT_TRADE_PROVIDER.WRAPPED) {
        receipt = await this.ethWethSwapProvider.createTrade(trade, options);
      } else {
        receipt = await this.checkFeeAndCreateTrade(providerName, trade, options);
      }

      this.updateTrade(transactionHash, true);

      await this.instantTradesApiService
        .notifyInstantTradesBot({
          provider: providerName,
          blockchain: trade.blockchain,
          walletAddress: receipt.from,
          trade,
          txHash: transactionHash
        })
        .catch(_err => {});
    } catch (err) {
      if (transactionHash && !this.isNotMinedError(err)) {
        this.updateTrade(transactionHash, false);
      }

      throw err;
    }
  }

  private async checkFeeAndCreateTrade(
    providerName: INSTANT_TRADE_PROVIDER,
    trade: InstantTrade,
    options: ItOptions
  ): Promise<Partial<TransactionReceipt>> {
    if (this.iframeService.isIframeWithFee(trade.blockchain, providerName)) {
      return this.createTradeWithFee(providerName, trade, options);
    }

    return this.providers[trade.blockchain][providerName].createTrade(trade, options);
  }

  private async createTradeWithFee(
    providerName: INSTANT_TRADE_PROVIDER,
    trade: InstantTrade,
    options: ItOptions
  ): Promise<Partial<TransactionReceipt>> {
    const feeContractAddress = IT_PROXY_FEE_CONTRACT_ADDRESS;
    const provider = this.providers[trade.blockchain][providerName];

    const transactionOptions = await provider.checkAndEncodeTrade(
      trade,
      options,
      feeContractAddress
    );

    const { feeData } = this.iframeService;
    const fee = feeData.fee * 1000;

    const promoterAddress = await this.iframeService.getPromoterAddress().toPromise();

    const methodName = promoterAddress
      ? IT_PROXY_FEE_CONTRACT_METHOD.SWAP_WITH_PROMOTER
      : IT_PROXY_FEE_CONTRACT_METHOD.SWAP;

    const methodArguments = [
      trade.from.token.address,
      trade.to.token.address,
      Web3Pure.toWei(trade.from.amount, trade.from.token.decimals),
      provider.contractAddress,
      transactionOptions.data,
      [fee, feeData.feeTarget]
    ];
    if (promoterAddress) {
      methodArguments.push(promoterAddress);
    }

    return this.web3PrivateService.tryExecuteContractMethod(
      feeContractAddress,
      IT_PROXY_FEE_CONTRACT_ABI,
      methodName,
      methodArguments,
      transactionOptions
    );
  }

  private async postTrade(
    transactionHash: string,
    providerName: INSTANT_TRADE_PROVIDER,
    trade: InstantTrade,
    fee?: number,
    promoCode?: string
  ): Promise<void> {
    await this.instantTradesApiService
      .createTrade(transactionHash, providerName, trade, fee, promoCode)
      .toPromise();
  }

  /**
   * Checks if error is that transaction was not yet mined.
   * @param err Error thrown during creating transaction.
   */
  private isNotMinedError(err: Error): boolean {
    return err.message.includes(
      'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
    );
  }

  /**
   * Calls api service method to update transaction's status.
   * @param hash Transaction's hash.
   * @param success If true status is `completed`, otherwise `cancelled`.
   */
  private updateTrade(hash: string, success: boolean): Subscription {
    return this.instantTradesApiService.patchTrade(hash, success).subscribe({
      error: err => console.debug('IT patch request is failed', err)
    });
  }

  private notifyGtmAfterSignTx(transactionHash: string): void {
    this.gtmService.fireTxSignedEvent(SWAP_PROVIDER_TYPE.INSTANT_TRADE, transactionHash);
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.showOpenMobileWallet();
    }
  }
}
